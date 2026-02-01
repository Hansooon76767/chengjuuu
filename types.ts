
export enum ProjectCategory {
  DRINKING = '酒局',
  OUTDOOR = '户外',
  BOARD_GAME = '桌游',
  DINING = '聚餐',
  SPORTS = '运动',
  WORKSHOP = '工作坊',
  OTHER = '其他'
}

export enum CostType {
  AA = 'AA制',
  TREATER = '我请客',
  FREE = '免费',
  SMART_SPLIT = '智能分摊'
}

export enum ProjectStatus {
  RECRUITING = '招募中',
  FULL = '已满员',
  IN_PROGRESS = '进行中',
  FINISHED = '已结束',
  ARCHIVED = '已归档'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  creditScore: number;
  tags: string[];
  joinedProjects: string[]; // Project IDs
  location?: string;
  birthDate?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface BillGroup {
  id: string;
  name: string;
  ratio: number; // percentage 0-100
  count: number;
}

export interface SmartBill {
  enabled: boolean;
  totalAmount: number;
  groups: BillGroup[];
  receiptImage: string | null;
}

export interface Project {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  title: string;
  description: string;
  category: ProjectCategory;
  city: string;
  location: string;
  time: string;
  maxPeople: number;
  currentPeople: number;
  costType: CostType;
  smartBill?: SmartBill; 
  status: ProjectStatus;
  participants: User[]; 
  chatMessages: Comment[];
  reviews: { raterId: string; targetId: string; rating: number }[];
  coverImage?: string;
  tags: string[]; // Added tags field
}

export type RootState = {
  currentUser: User;
  projects: Project[];
  users: User[]; 
};