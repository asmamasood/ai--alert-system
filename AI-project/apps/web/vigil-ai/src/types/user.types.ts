export type UserRole = 'citizen' | 'responder' | 'admin';
export type BadgeType = 'first_report' | 'verified_reporter' | 'hero' | 'rapid_responder';

export interface Badge {
  id: BadgeType;
  label: string;
  earnedAt: Date;
}

export interface UserStats {
  totalReports: number;
  verifiedReports: number;
  savedLives: number;
  trustScore: number; // 0–100
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  stats: UserStats;
  badges: Badge[];
  location?: {
    latitude: number;
    longitude: number;
  };
  isAnonymous: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
