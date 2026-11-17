export type AdminStats = {
  pendingPosts: number;
  publishedPosts: number;
  users: number;
  bannedUsers: number;
  pendingReports: number;
};

export type AdminPost = {
  id: string;
  title: string | null;
  content: string;
  status: string;
  createdAt: string;
  author: { id: string; nickname: string; email: string };
};

export type AdminReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  handledBy: string | null;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  email: string;
  nickname: string;
  status: string;
  createdAt: string;
  roles: string[];
};

export type AuditLog = {
  id: string;
  targetType: string;
  targetId: string;
  action: string;
  operatorId: string;
  reason: string | null;
  createdAt: string;
};
