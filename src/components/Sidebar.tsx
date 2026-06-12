import { Home, Search, Bell, User as UserIcon, PlusSquare, LogOut, Moon, Sun } from "lucide-react";
import { User } from "../types";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  onCreatePostClick: () => void;
  unreadCount: number;
}

export default function Sidebar({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onCreatePostClick,
  unreadCount
}: SidebarProps) {
  const menuItems = [
    { id: "feed", label: "Home Feed", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "notifications", label: "Notifications", icon: Bell, count: unreadCount },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-100 p-6 z-20 justify-between font-sans">
        <div className="space-y-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 px-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-display tracking-tight">
              ConnectHub
            </span>
          </div>

          {/* User Brief Card */}
          <div
            onClick={() => setTab("profile")}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100"
          >
            <img
              src={currentUser.profileImage}
              alt={currentUser.username}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 truncate">@{currentUser.username}</h4>
              <p className="text-xs text-slate-400 truncate">View Profile</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.count && item.count > 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                      {item.count}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {/* Create Post Action Button */}
            <button
              onClick={onCreatePostClick}
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all text-sm font-bold mt-4"
            >
              <PlusSquare className="w-5 h-5" />
              <span>Create Post</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3.5 border border-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all text-sm font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-30 font-sans shadow-lg shadow-slate-100">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="relative flex flex-col items-center justify-center w-12 h-12"
            >
              <Icon
                className={`w-6 h-6 transition-all duration-200 ${
                  isActive ? "text-indigo-600 scale-110" : "text-slate-400 hover:text-slate-600"
                }`}
              />
              {item.count && item.count > 0 ? (
                <span className="absolute -top-1 right-1 bg-rose-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full">
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Mobile Create Post button */}
        <button
          onClick={onCreatePostClick}
          className="flex items-center justify-center w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200"
        >
          <PlusSquare className="w-5 h-5" />
        </button>

        {/* Mobile Sign out button */}
        <button
          onClick={onLogout}
          className="flex items-center justify-center w-11 h-11 border border-slate-100 text-slate-400 rounded-xl"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>
    </>
  );
}
