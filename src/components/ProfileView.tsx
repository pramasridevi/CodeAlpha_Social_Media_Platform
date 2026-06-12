import React, { useState, useEffect } from "react";
import { User, UserProfileResponse, Post } from "../types";
import { Edit, Image, Check, Heart, MessageSquare, Shield, Smile, Calendar, Users, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileViewProps {
  usernameParam: string;
  currentUser: User;
  token: string;
  onViewUserProfile: (username: string) => void;
  onProfileUpdated: (updatedUser: User) => void;
}

export default function ProfileView({
  usernameParam,
  currentUser,
  token,
  onViewUserProfile,
  onProfileUpdated,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for Editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editPic, setEditPic] = useState("");
  const [updating, setUpdating] = useState(false);

  // States for Editing posts
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Overlay states for listing followers and following
  const [activeOverlayType, setActiveOverlayType] = useState<"followers" | "following" | null>(null);

  const isOwnProfile = currentUser.username.toLowerCase() === usernameParam.toLowerCase();

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/users/profile/${usernameParam}?currentUserId=${currentUser.id}`);
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to retrieve profile");
      }
      setProfile(data);
      // load initial edit states
      setEditBio(data.bio);
      setEditPic(data.profileImage);
    } catch (err: any) {
      setError(err.message || "User profile details unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [usernameParam, currentUser]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      const method = profile.isFollowing ? "DELETE" : "POST";
      const resp = await fetch(`/api/users/${profile.id}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resp.ok) {
        setProfile((prev) => {
          if (!prev) return null;
          const newIsFollowing = !prev.isFollowing;
          const delta = newIsFollowing ? 1 : -1;
          return {
            ...prev,
            isFollowing: newIsFollowing,
            followersCount: Math.max(0, prev.followersCount + delta),
          };
        });
      }
    } catch (err) {
      console.error("Failed to follow action", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const resp = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: editBio, profileImage: editPic }),
      });

      const data = await resp.json();
      if (resp.ok) {
        // App states callback
        onProfileUpdated(data.user);
        setIsEditing(false);
        // Refresh local view
        setProfile((prev) => (prev ? { ...prev, bio: data.user.bio, profileImage: data.user.profileImage } : null));
      }
    } catch (err) {
      console.error("Updating profile state failed", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const resp = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (resp.ok) {
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            postsCount: Math.max(0, prev.postsCount - 1),
            posts: prev.posts.filter((p) => p.id !== postId)
          };
        });
      } else {
        const data = await resp.json();
        console.warn("Failed to delete post:", data.error || "Unknown server error");
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editPostContent.trim()) return;
    try {
      const resp = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editPostContent })
      });
      if (resp.ok) {
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            posts: prev.posts.map((p) => p.id === postId ? { ...p, content: editPostContent } : p)
          };
        });
        setEditingPostId(null);
        setEditPostContent("");
      } else {
        const data = await resp.json();
        console.warn("Failed to update post:", data.error || "Unknown server error");
      }
    } catch (err) {
      console.error("Failed to edit post", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
        <p className="text-rose-500 font-semibold">{error || "Profile not found"}</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-24 md:pb-8 font-sans">
      {/* HEADER HERO AREA */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50/40 rounded-full blur-3xl -z-1" />

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          {/* Avatar frame */}
          <div className="relative shrink-0">
            <img
              src={profile.profileImage}
              alt={profile.username}
              referrerPolicy="no-referrer"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-100"
            />
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-1 right-1 bg-slate-900 border border-slate-800 text-white p-1.5 rounded-full hover:bg-slate-800 shadow-sm transition-all text-xs"
                title="Edit Avatar"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3.5 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-display">
                  @{profile.username}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                </span>
              </div>

              {/* Follow, Edit controllers */}
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 self-center md:self-auto"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Customize Personal bio</span>
                </button>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 font-bold rounded-xl text-xs transition-all self-center md:self-auto ${
                    profile.isFollowing
                      ? "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150"
                  }`}
                >
                  {profile.isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>

            {/* Profile bio section */}
            <p className="text-[14px] text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
              {profile.bio || "No profile description provided yet."}
            </p>

            {/* COUNT STATS ROW */}
            <div className="flex items-center justify-center md:justify-start gap-6 border-t border-slate-50 pt-4 text-xs">
              <div className="text-center md:text-left">
                <span className="block text-lg font-black text-slate-800 font-display">{profile.postsCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posts</span>
              </div>
              <div
                onClick={() => profile.followersList.length > 0 && setActiveOverlayType("followers")}
                className={`text-center md:text-left ${profile.followersList.length > 0 ? "cursor-pointer group" : ""}`}
              >
                <span className="block text-lg font-black text-slate-800 group-hover:text-indigo-600 font-display transition-colors">
                  {profile.followersCount}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                  Followers
                </span>
              </div>
              <div
                onClick={() => profile.followingList.length > 0 && setActiveOverlayType("following")}
                className={`text-center md:text-left ${profile.followingList.length > 0 ? "cursor-pointer group" : ""}`}
              >
                <span className="block text-lg font-black text-slate-800 group-hover:text-indigo-600 font-display transition-colors">
                  {profile.followingCount}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE DRAWER FORM */}
      {isEditing && isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 bg-white rounded-2xl border border-indigo-100 p-6 shadow-md"
        >
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-indigo-500" />
            <span>Customize bio & profile image</span>
          </h3>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Upload New Photo
              </label>
              <div className="flex gap-4 items-center">
                <img
                  src={editPic}
                  alt="Custom Avatar preview"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:rounded-lg file:text-xs file:bg-slate-100 file:font-semibold hover:file:bg-slate-200 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Biography / Bio
              </label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-all resize-none font-normal"
                placeholder="Write your creative description..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditBio(profile.bio);
                  setEditPic(profile.profileImage);
                }}
                className="px-3.5 py-2 border border-slate-100 hover:bg-slate-50 text-slate-500 font-semibold rounded-xl"
              >
                Discard Change
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-xs"
              >
                {updating ? "Saving Changes..." : "Apply Customize"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* USERS CORRESPONDENTS LIST MODAL (Followers / Following OVERLAYS) */}
      <AnimatePresence>
        {activeOverlayType && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveOverlayType(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{activeOverlayType === "followers" ? "Followers" : "Following"} List</span>
              </h3>

              <div className="max-h-64 overflow-y-auto space-y-3.5 divide-y divide-slate-50 pr-1.5">
                {((activeOverlayType === "followers" ? profile.followersList : profile.followingList) || []).map(
                  (userObj) => (
                    <div
                      key={userObj.id}
                      onClick={() => {
                        onViewUserProfile(userObj.username);
                        setActiveOverlayType(null);
                      }}
                      className="flex items-center gap-3 pt-3 first:pt-0 cursor-pointer hover:opacity-85"
                    >
                      <img
                        src={userObj.profileImage}
                        alt={userObj.username}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-100"
                      />
                      <span className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                        @{userObj.username}
                      </span>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER'S POSTS LISTING AREA */}
      <div className="mt-8 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1 font-display">
          Latest Posts from @{profile.username} ({profile.posts.length})
        </h3>

        {profile.posts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <span className="text-xs text-slate-400">No posts shared yet by this user.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {profile.posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all text-xs relative"
              >
                {/* Edit / Delete actions for own posts */}
                {isOwnProfile && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {postToDelete === post.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-2 py-1 rounded-xl">
                        <span className="text-[10px] text-rose-600 font-bold mr-1">Delete?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post.id);
                            setPostToDelete(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToDelete(null);
                          }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg text-[10px] transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPostId(post.id);
                            setEditPostContent(post.content);
                          }}
                          className="p-1.5 hover:bg-slate-50 hover:text-indigo-600 rounded-lg text-slate-400 transition-colors"
                          title="Edit Post"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToDelete(post.id);
                          }}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {editingPostId === post.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editPostContent}
                      onChange={(e) => setEditPostContent(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-xs resize-none"
                    />
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-2.5 py-1.5 border border-slate-100 rounded-lg font-medium text-slate-500 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed pr-12">{post.content}</p>
                )}

                {post.imageUrl && (
                  <div className="mt-3.5 rounded-xl overflow-hidden max-h-48 border border-slate-100 bg-slate-50">
                    <img
                      src={post.imageUrl}
                      alt="Thumbnail feed"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-4 text-[10px] font-bold text-slate-400 mt-3.5 pt-3.5 border-t border-slate-50">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
