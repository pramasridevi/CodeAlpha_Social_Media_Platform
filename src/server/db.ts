import fs from "fs";
import path from "path";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  profileImage: string;
  bio: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  commentText: string;
  createdAt: string;
}

export interface Follower {
  id: string;
  followerId: string;
  followingId: string;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  senderId: string;
  receiverId: string;
  postId?: string;
  commentText?: string;
  read: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  posts: Post[];
  comments: Comment[];
  followers: Follower[];
  likes: Like[];
  notifications: Notification[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Initial preseeded data for outstanding first-time user experience
const initialData: DatabaseSchema = {
  users: [
    {
      id: "user-1",
      username: "alex_explorer",
      email: "alex@connecthub.com",
      passwordHash: "$2a$10$M8Y8i5Z8/Wd2q7FzC5g7e.42vNRErE9j.uR6XfS7a9V76m1J8H8rG", // bcrypt hash for 'password123'
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      bio: "Adventurer & Photographer. Capturing the world one frame at a time. 🏔️📸",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "user-2",
      username: "elena_codes",
      email: "elena@connecthub.com",
      passwordHash: "$2a$10$M8Y8i5Z8/Wd2q7FzC5g7e.42vNRErE9j.uR6XfS7a9V76m1J8H8rG", // 'password123'
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      bio: "Software Engineer | Open Source Enthusiast. Translating coffee into clean React code. ☕💻",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "user-3",
      username: "marcus_creatives",
      email: "marcus@connecthub.com",
      passwordHash: "$2a$10$M8Y8i5Z8/Wd2q7FzC5g7e.42vNRErE9j.uR6XfS7a9V76m1J8H8rG", // 'password123'
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      bio: "UI/UX Designer & Architect. Minimalist enthusiast. Design is not just what it looks like.",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  posts: [
    {
      id: "post-1",
      userId: "user-1",
      content: "Chasing the early morning light in the valleys of Switzerland. The air was crisp, and the silence was Golden. 🌲✨ #mountainlife #wanderlust",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      likesCount: 2,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "post-2",
      userId: "user-2",
      content: "Just shipped a major update to ConnectHub! React Server Components meet absolute aesthetic clean styling. Can't wait for your feedback! 🚀💻🎨",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
      likesCount: 1,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "post-3",
      userId: "user-3",
      content: "A beautiful brutalist layout structure I'm working on today. Focus on bold typography, asymmetry, and raw grids. Space is the luxury.",
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      likesCount: 0,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ],
  comments: [
    {
      id: "comment-1",
      postId: "post-1",
      userId: "user-2",
      commentText: "This is breathtaking, Alex! Adding this place to my travel bucket list.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "comment-2",
      postId: "post-1",
      userId: "user-3",
      commentText: "The composition is stunning. Love the natural framing lines.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "comment-3",
      postId: "post-2",
      userId: "user-1",
      commentText: "Fantastic work! The app transitions are buttery smooth. 🔥",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
    }
  ],
  followers: [
    { id: "f-1", followerId: "user-2", followingId: "user-1" },
    { id: "f-2", followerId: "user-3", followingId: "user-1" },
    { id: "f-3", followerId: "user-1", followingId: "user-2" }
  ],
  likes: [
    { id: "l-1", userId: "user-2", postId: "post-1" },
    { id: "l-2", userId: "user-3", postId: "post-1" },
    { id: "l-3", userId: "user-1", postId: "post-2" }
  ],
  notifications: [
    {
      id: "notif-1",
      type: "like",
      senderId: "user-2",
      receiverId: "user-1",
      postId: "post-1",
      read: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "notif-2",
      type: "comment",
      senderId: "user-2",
      receiverId: "user-1",
      postId: "post-1",
      commentText: "This is breathtaking, Alex! Adding this place to my travel bucket list.",
      read: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "notif-3",
      type: "follow",
      senderId: "user-2",
      receiverId: "user-1",
      read: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Helper to load db
export function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read database", err);
    return initialData;
  }
}

// Helper to save db
export function writeDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to database", err);
  }
}
