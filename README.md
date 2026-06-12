# ConnectHub - MERN Full-Stack Social Media Platform

ConnectHub is a high-performance, responsive **MERN Stack (MongoDB, Express, React, Node.js)** social media platform resembling Instagram and Twitter. Built with React (TypeScript), Vite, Tailwind CSS v4, Node.js, and Express, it is architected with clear modular patterns, making it highly professional for technical portfolios, resume reviews, and internship submissions.

---

## 🚀 Key Features

*   **🔒 Secure Authentication**: Robust JWT-based security workflow with password salting/hashing via `bcryptjs` and session tokens stored in `localStorage` securely.
*   **🏔️ Dynamic Profiles**: Browse profiles, customize bios, and upload high-resolution profile pictures processed on the fly using a robust `FileReader` Base64 stream inside the browser.
*   **📷 Rich Post Feed**: Interactive publishing of texts and image cards with full CRUD control (edit and delete updates on own posts).
*   **💬 Nestable Comments**: Write comments instantly and delete them with cascading safety checks.
*   **❤️ Intelligent Like Counter**: Like and unlike posts comfortably with real-time feedback and double-tap prevention.
*   **📡 Follower Networks**: Connect with creators; follow/unfollow and watch follower ratios and profiles update dynamically.
*   **🎭 Unified Search**: Find developers and artists instantly by keywords matching usernames or post texts.
*   **🔔 Real-Time Notifications**: Instant detailed alerts for new followers, likes on your posts, or comment mentions.
*   **☕ Built-In Preseeds**: Pre-seeded with three polished developer/artist portfolio accounts (`alex_explorer`, `elena_codes`, `marcus_creatives` with password `password123`) for an amazing out-of-the-box review experience.

---

## 💾 Database Architecture & MERN Schema (MongoDB/Mongoose)

To provide an instant, zero-configuration preview, the live sandbox utilizes a reliable, lightweight document-store database engine in `data/db.json` which maps exactly to document-based JSON records.

For database migration, production deployment, or resume display, here are the ready-to-drop **Mongoose (MongoDB)** model definitions:

### 1. User Model (`models/User.js`)
```javascript
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  profileImage: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format" },
  bio: { type: String, default: "Hey there! I am using ConnectHub." },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
```

### 2. Post Model (`models/Post.js`)
```javascript
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', PostSchema);
```

### 3. Comment Model (`models/Comment.js`)
```javascript
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', CommentSchema);
```

### 4. Follower Model (`models/Follower.js`)
```javascript
import mongoose from 'mongoose';

const FollowerSchema = new mongoose.Schema({
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followingId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.model('Followers', FollowerSchema);
```

---

## 📁 Technical Architecture & File Tree

The application is structured modularly following clean enterprise principles:

```text
├── .env.example              # Documented Environment configuration defaults
├── data/
│   └── db.json               # Local JSON document database preseeded with sample stories
├── src/
│   ├── components/
│   │   ├── AuthView.tsx      # Login, registration, and demo-select cards
│   │   ├── Sidebar.tsx       # Responsive main navigation drawer (collapses on mobile)
│   │   ├── FeedView.tsx      # Smart posts renderer, editing, likes, & comments
│   │   ├── SearchView.tsx    # Multi-term query solver targeting posts and accounts
│   │   ├── NotificationsView.tsx # Historic logs with mark-all-as-read triggers
│   │   ├── ProfileView.tsx   # Core stats, biography editing, and connection overlays
│   │   └── CreatePostModal.tsx # Post generation window with Base64 asset encoders
│   ├── App.tsx               # Orchestrator and central session provider
│   ├── types.ts              # Global front-end structural interfaces
│   ├── index.css             # CSS loading Inter & Outfit typography with Tailwind CSS v4 variables
│   └── main.tsx              # React mounting root
├── server.ts                 # Back-end Express REST API controller & static provider
├── package.json              # Applet deployment script configurations
└── tsconfig.json             # Strongly configured type-safety rules
```

---

## 🏛️ REST API Endpoints

### 🔐 Authentication
*   `POST /api/auth/register` - Create user profile, secure password with Bcrypt + issue JWT check
*   `POST /api/auth/login` - Verify credentials, sign and set JWT session
*   `GET /api/users/me` - Retrieves authenticated identity details

### 👤 Profile & Followers
*   `GET /api/users/profile/:username` - Read biography, follower rosters, and user's posts
*   `PUT /api/users/me` - Customize bio and profile avatar URL
*   `POST /api/users/:userId/follow` - Subscribe/follow user and trigger notification
*   `DELETE /api/users/:userId/follow` - Unfollow user

### 📝 Posts, Likes & Comments
*   `GET /api/posts` - Lists explore or follow-only feeds with interactive liking states
*   `POST /api/posts` - Creates text/image post with secure Base64 streaming
*   `PUT /api/posts/:id` - Edit post content
*   `DELETE /api/posts/:id` - Deletes post, related comments, and related likes
*   `POST /api/posts/:postId/like` - Like post + alert owner
*   `DELETE /api/posts/:postId/like` - Unlike a post
*   `POST /api/posts/:postId/comments` - Place comments on posts + alert owner
*   `DELETE /api/comments/:commentId` - Deletes own comment

### 🔍 Search & Notifications
*   `GET /api/search` - Look up users or search post content
*   `GET /api/notifications` - Retrieve incoming notifications timeline
*   `PUT /api/notifications/read` - Batch clear unread activity alerts

---

## 🛠️ Performance & Build Pipeline

The package runs efficiently in Node.js:

```bash
# 1. Install system requirements
npm install

# 2. Launch high-performance development server (Express with live Vite hot reload)
npm run dev

# 3. Create a production build of React files and Express bundle
npm run build

# 4. Start production server
npm start
```

---

## 🔑 Environment Secrets
Copy `.env.example` into `.env` and configure:
*   `JWT_SECRET`: Signature key for signing web tokens
*   `MONGODB_URI`: Connection endpoint for cloud clusters (e.g. Atlas) when converting from document-store file database.
