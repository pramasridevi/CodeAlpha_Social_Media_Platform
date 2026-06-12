import React, { useState } from "react";
import { X, Image, FileText, Send, Orbit } from "lucide-react";
import { motion } from "motion/react";

interface CreatePostModalProps {
  onClose: () => void;
  token: string;
  onPostCreated: (newPost: any) => void;
}

export default function CreatePostModal({ onClose, token, onPostCreated }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size too large. Prefer under 10MB");
        return;
      }
      setUploading(true);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Error reading file stream");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      setError("Please write some text or attach an image");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const resp = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, imageUrl })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Post publication failed");
      }

      onPostCreated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create post. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-slate-800 font-display mb-1 flex items-center gap-1.5">
          <Orbit className="h-5 w-5 text-indigo-600 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Post an Update</span>
        </h3>
        <p className="text-slate-400 text-xs mb-5">Share what you're building, thinking, or capture moments on ConnectHub.</p>

        {error && (
          <div className="mb-4 p-3 text-xs bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What is spectacular today? Type your update..."
              rows={4}
              maxLength={1000}
              className="w-full p-4 border border-slate-200 focus:border-indigo-500 rounded-xl outline-none text-sm resize-none text-slate-800 placeholder-slate-400 font-normal"
            />
            <div className="flex justify-end text-[10px] font-bold text-slate-300 mt-1">
              {content.length}/1000 characters
            </div>
          </div>

          {/* Photo attachment preview */}
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 max-h-40 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Upload preview"
                referrerPolicy="no-referrer"
                className="max-h-48 max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-slate-900 border border-slate-800 text-white p-1 rounded-full text-xs hover:bg-slate-800"
                title="Remove Image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            {/* File Upload Selector */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-indigo-600 text-xs font-semibold self-start sm:self-auto select-none">
              <Image className="w-5 h-5 text-indigo-500" />
              <span>{imageUrl ? "Replace photo" : "Select image file"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Actions */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="w-1/2 sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100 hover:opacity-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
