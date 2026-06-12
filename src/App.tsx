import React, { useState, useEffect } from "react";
import { User } from "./types";
import AuthView from "./components/AuthView";
import Sidebar from "./components/Sidebar";
import FeedView from "./components/FeedView";
import SearchView from "./components/SearchView";
import NotificationsView from "./components/NotificationsView";
import ProfileView from "./components/ProfileView";
import CreatePostModal from "./components/CreatePostModal";
import { AnimatePresence } from "motion/react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentTab, setTab] = useState("feed");
  const [profileUsername, setProfileUsername] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Restore authenticated states on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("connecthub_user");
    const storedToken = localStorage.getItem("connecthub_token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setToken(storedToken);
        setProfileUsername(parsedUser.username);
        // Verify current token by fetching user profile me
        fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        })
          .then((r) => {
            if (!r.ok) {
              // stale token, cleanup
              handleLogout();
            }
          })
          .catch(() => {
            // offline, keep local user
          });
      } catch (err) {
        localStorage.clear();
      }
    }
    setAuthChecking(false);
  }, []);

  // Sync notification counts
  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const resp = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await resp.json();
      if (resp.ok && Array.isArray(data)) {
        const unread = data.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Count sync failed", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleAuthSuccess = (user: User, userToken: string) => {
    localStorage.setItem("connecthub_user", JSON.stringify(user));
    localStorage.setItem("connecthub_token", userToken);
    setCurrentUser(user);
    setToken(userToken);
    setProfileUsername(user.username);
    setTab("feed");
  };

  const handleLogout = () => {
    localStorage.removeItem("connecthub_user");
    localStorage.removeItem("connecthub_token");
    setCurrentUser(null);
    setToken(null);
    setTab("feed");
  };

  const handleViewUserProfile = (username: string) => {
    setProfileUsername(username);
    setTab("profile");
  };

  const handlePostCreated = () => {
    // If we're on the feed and create a post, we trigger reload by selecting tab
    // We toggle current tab to force component refetch
    setTab((prev) => (prev === "feed" ? "feed" : "feed"));
  };

  const handleProfileUpdated = (updatedUser: User) => {
    localStorage.setItem("connecthub_user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser || !token) {
    return <AuthView onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-55 text-slate-800 font-sans md:pl-64">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        setTab={(tab) => {
          if (tab === "profile") {
            setProfileUsername(currentUser.username);
          }
          setTab(tab);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onCreatePostClick={() => setIsCreateModalOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main interactive route render containers */}
      <main className="min-h-screen">
        {currentTab === "feed" && (
          <FeedView
            currentUser={currentUser}
            token={token}
            onViewUserProfile={handleViewUserProfile}
          />
        )}

        {currentTab === "search" && (
          <SearchView
            token={token}
            onViewUserProfile={handleViewUserProfile}
          />
        )}

        {currentTab === "notifications" && (
          <NotificationsView
            token={token}
            onViewUserProfile={handleViewUserProfile}
            onRefreshCount={fetchUnreadCount}
          />
        )}

        {currentTab === "profile" && (
          <ProfileView
            usernameParam={profileUsername}
            currentUser={currentUser}
            token={token}
            onViewUserProfile={handleViewUserProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </main>

      {/* Overlay Create Post Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreatePostModal
            onClose={() => setIsCreateModalOpen(false)}
            token={token}
            onPostCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
