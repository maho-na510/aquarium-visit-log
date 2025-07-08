// ユーザー関連の型
export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  favoriteAquariums: AquariumSummary[];
  visitCount: number;
  wishlistCount: number;
  createdAt: string;
}

// 水族館関連の型
export interface Aquarium {
  id: number;
  name: string;
  description?: string;
  address: string;
  prefecture: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    regular?: string;
    summer?: string;
    goldenWeek?: string;
    springCummer?: string;
    autumnWinter?: string;
    weekday?: string;
    holiday?: string;
    recentVisits?: RecentVisit[];
  };
  admissionFee?: {
    adult?: number;
    highSchool?: number;
    elementary?: number;
    child?: number;
    infant?: number;
  };
  averageRating: number;
  visitCount: number;
  visited: boolean;
  inWishlist: boolean;
  createdBy?: number;
  latestPhotoUrl?: string;
}

export interface AquariumSummary {
  id: number;
  name: string;
  address: string;
  prefecture: string;
  latitude?: number;
  longitude?: number;
  averageRating?: number;
  visitCount?: number;
}

// 訪問記録関連の型
export interface Visit {
  id: number;
  aquarium: AquariumSummary;
  user: {
    id: number;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  visitedAt: string;
  weather?: string;
  rating?: number;
  memo?: string;
  goodExhibits?: string[];
  photoUrls: string[];
  videoUrls: string[];
  photoCount: number;
  videoCount?: number;
  createdAt: string;
  updatedAt: string;
}
export interface RecentVisit {
  id: number;
  userName: string;
  visitedAt: string;
  rating?: number;
  photoCount: number;
}

export interface VisitForm {
  aquariumId: number;
  visitedAt: string;
  weather?: string;
  rating?: number;
  memo?: string;
  goodExhibitsList?: string[];
  photos?: File[];
  videos?: File[];
}

// 行きたいリスト関連の型
export interface WishlistItem {
  id: number;
  aquarium: AquariumSummary;
  priority?: number;
  memo?: string;
  createdAt: string;
}

// ランキング関連の型
export interface RankingItem {
  rank: number;
  id: number;
  name: string;
  address: string;
  prefecture: string;
  latitude: number;
  longitude: number;
  visitCount?: number;
  averageRating?: number;
  ratingCount?: number;
  isTop5: boolean;
  latestPhotoUrl?: string;
  latestVisit?: string;
}

// ページネーション
export interface Pagination {
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
  totalCount: number;
}

// APIレスポンス
export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
}

// 検索パラメータ
export interface SearchParams {
  q?: string;
  prefecture?: string;
  visited?: boolean;
  sort?: 'rating' | 'visits' | 'distance';
  lat?: number;
  lng?: number;
  distance?: number;
  page?: number;
  per?: number;
}