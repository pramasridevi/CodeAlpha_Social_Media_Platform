export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  profileImage: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  commentText: string;
  createdAt: string;
  username: string;
  profileImage: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  profileImage: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  comments: Comment[];
}

export interface FollowerUser {
  id: string;
  username: string;
  profileImage: string;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  profileImage: string;
  bio: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  posts: Post[];
  followersList: FollowerUser[];
  followingList: FollowerUser[];
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  senderId: string;
  senderUsername: string;
  senderProfileImage: string;
  receiverId: string;
  postId?: string;
  commentText?: string;
  read: boolean;
  createdAt: string;
}
