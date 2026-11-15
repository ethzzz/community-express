export type Author = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
};

export type Post = {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author?: Author;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author?: Author;
};

export type Notification = {
  id: string;
  type: string;
  actorId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  createdAt: string;
  readAt?: string | null;
};
