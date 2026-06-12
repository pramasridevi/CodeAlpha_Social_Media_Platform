import { useEffect, useState } from "react";
import { Bell, Heart, UserPlus, MessageCircle, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notification } from "../types";

interface NotificationsViewProps {
  token: string;
  onViewUserProfile: (username: string) => void;
  onRefreshCount: () => void;
}

export default function NotificationsView({
  token,
  onViewUserProfile,
  onRefreshCount
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const resp = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await resp.json();
      if (resp.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const resp = await fetch("/api/notifications/read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (resp.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        onRefreshCount();
      }
    } catch (err) {
      console.error("Failed to write reads to notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

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
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 pb-24 md:pb-8 font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 font-display">Activity & Logs</h2>
          <p className="text-xs text-slate-400 mt-1">Stay up to date with follows, comments, and post likes.</p>
        </div>
        
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark read</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="p-3 bg-indigo-50/50 text-indigo-500 rounded-full inline-flex mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 animate-pulse">Silence is Golden</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            When other people start following you, liking your pictures, or writing comments, their triggers will appear here in real-time.
          </p>
        </div>
      )}

      {/* NOTIFICATION FEED */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((notif) => {
            let IconComp = Bell;
            let iconColor = "text-slate-400 bg-slate-50";
            let actionText = "";

            if (notif.type === "like") {
              IconComp = Heart;
              iconColor = "text-rose-500 bg-rose-50";
              actionText = "liked your post";
            } else if (notif.type === "follow") {
              IconComp = UserPlus;
              iconColor = "text-cyan-500 bg-cyan-50";
              actionText = "started following you";
            } else if (notif.type === "comment") {
              IconComp = MessageCircle;
              iconColor = "text-indigo-500 bg-indigo-50";
              actionText = `commented: "${notif.commentText}"`;
            }

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex gap-3.5 p-4 rounded-2xl border transition-all ${
                  notif.read
                    ? "bg-white border-slate-100/70"
                    : "bg-slate-900/[0.02] border-indigo-100 shadow-xs"
                }`}
              >
                {/* Visual Icon */}
                <div className={`p-2.5 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                  <IconComp className="w-5 h-5 fill-current" />
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      onClick={() => onViewUserProfile(notif.senderUsername)}
                      className="font-bold text-xs text-slate-800 hover:text-indigo-600 cursor-pointer"
                    >
                      @{notif.senderUsername}
                    </span>
                    <span className="text-xs text-slate-500">{actionText}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    {formatDistance(notif.createdAt)}
                  </span>
                </div>

                {/* Optional sender avatar side preview */}
                <div
                  onClick={() => onViewUserProfile(notif.senderUsername)}
                  className="shrink-0 cursor-pointer hover:opacity-80"
                >
                  <img
                    src={notif.senderProfileImage}
                    alt={notif.senderUsername}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-150"
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
