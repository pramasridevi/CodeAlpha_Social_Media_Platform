import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, Eye, EyeOff, ShieldCheck, Stars } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";

const AVATAR_PRESETS = [
  { id: "boy1", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", label: "Boy", description: "Classic Boy" },
  { id: "girl1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", label: "Girl", description: "Creative Girl" },
  { id: "boy2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", label: "Boy", description: "Casual Boy" },
  { id: "girl2", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", label: "Girl", description: "Casual Girl" },
  { id: "boy3", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", label: "Boy", description: "Creative Boy" },
  { id: "girl3", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", label: "Girl", description: "Creative Girl" },
];

interface AuthViewProps {
  onSuccess: (user: User, token: string) => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(AVATAR_PRESETS[0].url);
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (demoUser: string) => {
    setUsername(demoUser);
    setPassword("password123");
    setIsLogin(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { usernameOrEmail: username, password }
      : { username, email, password, bio, profileImage };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during authentication");
      }

      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Convert profile image file to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-indigo-100 p-3 rounded-2xl mb-3 text-indigo-600">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            ConnectHub
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? "Welcome back! Connect with your friends." : "Create your account to get started"}
          </p>
        </div>

        {/* Demo Accounts Quick-Select */}
        {isLogin && (
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
              <Stars className="h-3.5 w-3.5 animate-pulse" />
              <span>Explore as test account (Password: password123)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["alex_explorer", "elena_codes", "marcus_creatives"].map((demoName) => (
                <button
                  key={demoName}
                  onClick={() => handleDemoLogin(demoName)}
                  type="button"
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg transition-all"
                >
                  @{demoName}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 text-sm bg-rose-50 text-rose-600 rounded-xl border border-rose-200"
          >
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Profile Photo
              </label>
              
              {/* Main Preview */}
              <div className="flex items-center gap-4">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="h-16 w-16 rounded-full object-cover border-2 border-indigo-600 shadow-md bg-white shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 text-xs shrink-0">
                    No image
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Choose a default character or upload your own below:</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pick an avatar matching your vibe!</p>
                </div>
              </div>

              {/* Starter Presets */}
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Starter Boy & Girl Avatars:
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = profileImage === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setProfileImage(preset.url)}
                        className={`relative rounded-full aspect-square border-2 transition-all p-0.5 overflow-hidden bg-white ${
                          isSelected
                            ? "border-indigo-600 scale-105 shadow-sm"
                            : "border-slate-200 hover:border-indigo-300"
                        }`}
                        title={preset.description}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                        <span className={`absolute bottom-0 inset-x-0 text-[8px] text-white font-bold leading-none py-0.5 text-center ${
                          preset.label === "Boy" ? "bg-blue-500/95" : "bg-pink-500/95"
                        }`}>
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Uploader Divider */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Or upload a custom picture:
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
              {isLogin ? "Username or Email Address" : "Choose Username"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                {isLogin ? <Mail className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isLogin ? "e.g. alex_explorer" : "e.g. wanderer_john"}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl text-sm outline-none transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@domain.com"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl text-sm outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl text-sm outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={2}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-slate-800 rounded-xl text-sm outline-none transition-all resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition-all focus:outline-none"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
