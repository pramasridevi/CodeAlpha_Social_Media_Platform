import React, { useState, useEffect } from "react";
import { Search, User as UserIcon, MessageSquare, Compass, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, Post } from "../types";

interface SearchViewProps {
  token: string;
  onViewUserProfile: (username: string) => void;
  onPostClick?: (post: Post) => void;
}

export default function SearchView({ token, onViewUserProfile }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Trigger search on query change with input-debounce effect
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const resp = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await resp.json();
        if (resp.ok) {
          setUsers(data.users || []);
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, token]);

  return (
    <div className="max-w-xl mx-auto py-8 px-4 pb-24 md:pb-8 font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-800 font-display">Explore ConnectHub</h2>
        <p className="text-xs text-slate-400 mt-1">Discover engineers, designers, creators, and text posts.</p>
      </div>

      {/* SEARCH BOX */}
      <div className="relative mb-8">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search usernames, bios, or post text..."
          className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 shadow-sm rounded-2xl text-sm focus:border-indigo-500 hover:border-slate-200 outline-none transition-all placeholder-slate-400"
        />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && !query && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full inline-flex mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Awaiting your search</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Try typing keywords like <b>"React"</b>, <b>"explorer"</b>, or <b>"Brutalist"</b> to see pre-seeded examples in action!
          </p>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {!loading && query && (
        <div className="space-y-8">
          {/* USER RESULTS */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Users Found ({users.length})</span>
            </h3>
            
            {users.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white rounded-2xl border border-slate-50 p-4 shadow-xs">
                No users found matching "{query}"
              </p>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 shadow-sm overflow-hidden animate-fade-in">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => onViewUserProfile(u.username)}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={u.profileImage}
                        alt={u.username}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">@{u.username}</h4>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{u.bio || "No bio info"}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* POST RESULTS */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Matching Posts ({posts.length})</span>
            </h3>

            {posts.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white rounded-2xl border border-slate-50 p-4 shadow-xs">
                No posts found matching "{query}"
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => onViewUserProfile(p.username)}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={p.profileImage}
                        alt="Author preview"
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-800">@{p.username}</span>
                      <span className="text-[10px] text-slate-400">
                        • {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap truncate max-h-16">
                      {p.content}
                    </p>
                    {p.imageUrl && (
                      <div className="relative h-16 w-32 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                        <img
                          src={p.imageUrl}
                          alt="Post thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
