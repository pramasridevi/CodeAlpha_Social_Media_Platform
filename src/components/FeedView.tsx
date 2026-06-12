import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, MoreHorizontal, Edit3, Trash2, Send, Flame, Globe, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Post, User, Comment } from "../types";

interface FeedViewProps {
  currentUser: User;
  token: string;
  onViewUserProfile: (username: string) => void;
}

export default function FeedView({ currentUser, token, onViewUserProfile }: FeedViewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<"all" | "following">("all");
  
  // Managing edit states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Managing deletion confirmation states
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Managing comments
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/posts?currentUserId=${currentUser.id}&filter=${feedFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Failed to load feed");
      }
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [feedFilter]);

  // Handle Like/Unlike
  const handleLikeToggle = async (post: Post) => {
    try {
      const method = post.isLiked ? "DELETE" : "POST";
      const resp = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await resp.json();
      
      if (resp.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === post.id
              ? { ...p, isLiked: !post.isLiked, likesCount: data.likesCount }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const resp = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ commentText: text })
      });

      const newComment = await resp.json();
      if (resp.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                commentsCount: p.commentsCount + 1,
                comments: [...p.comments, newComment]
              };
            }
            return p;
          })
        );
        // Clear input
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (err) {
      console.error("Failed to submit comment", err);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const resp = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resp.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                commentsCount: Math.max(0, p.commentsCount - 1),
                comments: p.comments.filter((c) => c.id !== commentId)
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Comment deletion failed", err);
    }
  };

  // Handle deleting a post
  const handleDeletePost = async (postId: string) => {
    try {
      const resp = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (resp.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  // Handle submitting edited post
  const handleUpdatePost = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      const resp = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });
      if (resp.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, content: editContent } : p))
        );
        setEditingPostId(null);
        setEditContent("");
      }
    } catch (err) {
      console.error("Failed to edit post", err);
    }
  };

  const formatDistance = (dateStr: string) => {
    const past = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleCommentReply = (postId: string, username: string) => {
    setCommentInputs((prev) => {
      const currentText = prev[postId] || "";
      const mention = `@${username} `;
      if (currentText.includes(mention)) return prev;
      return {
        ...prev,
        [postId]: mention + currentText
      };
    });

    // Short timeout to let react commit any state changes, then focus
    setTimeout(() => {
      const inputEl = document.getElementById(`comment-input-${postId}`);
      if (inputEl) {
        (inputEl as HTMLInputElement).focus();
      }
    }, 50);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 pb-24 md:pb-8 font-sans">
      {/* FILTER TABS */}
      <div className="flex bg-white p-1 rounded-xl mb-6 shadow-sm border border-slate-100/80">
        <button
          onClick={() => setFeedFilter("all")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            feedFilter === "all"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Explore Feed</span>
        </button>
        <button
          onClick={() => setFeedFilter("following")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            feedFilter === "following"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Following Only</span>
        </button>
      </div>

      {loading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 rounded w-1/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/6" />
                </div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-40 bg-slate-150 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-rose-500 text-sm font-semibold">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-3 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all"
          >
            Retry Fetching Feed
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No posts feed available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {feedFilter === "all"
              ? "Be the first to share your achievements or create a post!"
              : "You are not following any other users yet, or they haven't posted. Try Explorer Feed!"}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-50">
                <div
                  onClick={() => onViewUserProfile(post.username)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={post.profileImage}
                    alt={post.username}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      @{post.username}
                    </h4>
                    <p className="text-slate-400 text-[11px] font-medium">{formatDistance(post.createdAt)}</p>
                  </div>
                </div>

                {/* Post Settings triggers */}
                {post.userId === currentUser.id && (
                  <div className="flex items-center gap-1.5">
                    {postToDelete === post.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-2 py-1 rounded-xl">
                        <span className="text-[10px] text-rose-600 font-bold mr-1">Delete?</span>
                        <button
                          onClick={() => {
                            handleDeletePost(post.id);
                            setPostToDelete(null);
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setPostToDelete(null)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-lg text-[10px] transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditContent(post.content);
                          }}
                          className="p-1.5 hover:bg-slate-50 hover:text-indigo-600 rounded-lg text-slate-400 transition-colors"
                          title="Edit Post"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPostToDelete(post.id)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {editingPostId === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm resize-none"
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setEditingPostId(null)}
                        className="px-3 py-1.5 border border-slate-100 rounded-lg font-medium text-slate-500 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdatePost(post.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                )}

                {post.imageUrl && (
                  <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img
                      src={post.imageUrl}
                      alt="Post visual"
                      referrerPolicy="no-referrer"
                      className="w-full max-h-96 object-cover mx-auto hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                )}
              </div>

              {/* Card Interactions Counter */}
              <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/20 flex gap-4 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => handleLikeToggle(post)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-all ${
                    post.isLiked
                      ? "text-rose-600 bg-rose-50/50"
                      : "hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                  <span>{post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}</span>
                </button>

                <div className="flex items-center gap-1.5 py-1 px-2.5">
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  <span>{post.commentsCount} {post.commentsCount === 1 ? "Comment" : "Comments"}</span>
                </div>
              </div>

              {/* Comments Section */}
              <div className="p-4 border-t border-slate-50 bg-slate-50/10 space-y-3">
                {/* Scrollable List of existing comments */}
                {post.comments.length > 0 && (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 text-xs items-start justify-between group">
                        <div className="flex gap-2 items-start flex-1 min-w-0">
                          <img
                            src={comment.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                            alt={comment.username}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              onClick={() => onViewUserProfile(comment.username)}
                              className="font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer mr-1.5"
                            >
                              @{comment.username}
                            </span>
                            <span className="text-slate-600 break-words leading-relaxed">{comment.commentText}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] text-slate-400 font-medium">
                                {formatDistance(comment.createdAt)}
                              </span>
                              <button
                                onClick={() => handleCommentReply(post.id, comment.username)}
                                className="text-[9px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline cursor-pointer select-none"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Author delete commenter or post owner */}
                        {(comment.userId === currentUser.id || post.userId === currentUser.id) && (
                          <div className="flex items-center gap-1">
                            {commentToDelete === comment.id ? (
                              <div className="flex items-center gap-1 bg-rose-55 px-1.5 py-0.5 rounded-md border border-rose-100">
                                <span className="text-[9px] text-rose-600 font-bold">Delete?</span>
                                <button
                                  onClick={() => {
                                    handleDeleteComment(post.id, comment.id);
                                    setCommentToDelete(null);
                                  }}
                                  className="text-[9px] font-black text-rose-600 hover:underline px-0.5"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setCommentToDelete(null)}
                                  className="text-[9px] font-bold text-slate-400 hover:underline px-0.5"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCommentToDelete(comment.id)}
                                className="opacity-45 md:opacity-0 md:group-hover:opacity-100 hover:text-rose-600 p-1 text-slate-350 hover:opacity-100 transition-opacity"
                                title="Delete Comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    id={`comment-input-${post.id}`}
                    value={commentInputs[post.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    placeholder="Add a comment..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComment(post.id);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className="p-2 text-indigo-600 disabled:text-slate-300 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
