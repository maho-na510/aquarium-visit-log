import apiClient from './api';
import { Aquarium, SearchParams, Pagination, RankingItem } from '../types';

interface AquariumsResponse {
  aquariums: Aquarium[];
  pagination: Pagination;
}

interface RankingsResponse {
  rankings: RankingItem[];
  period?: string;
  prefecture?: string;
  minVisits?: number;
}

export const aquariumService = {
  // =====================
  // 基本取得系
  // =====================

  // 水族館一覧を取得
  async getAquariums(params?: SearchParams): Promise<AquariumsResponse> {
    const response = await apiClient.get('/aquariums', { params });
    return response.data;
  },

  // 水族館詳細を取得
  async getAquarium(id: number): Promise<Aquarium> {
    const response = await apiClient.get(`/aquariums/${id}`);
    return response.data;
  },

  // =====================
  // CRUD（admin）
  // =====================

  // 水族館を作成
  async createAquarium(data: Partial<Aquarium>): Promise<Aquarium> {
    const response = await apiClient.post('/aquariums', { aquarium: data });
    return response.data;
  },

  // 水族館を更新
  async updateAquarium(id: number, data: Partial<Aquarium>): Promise<Aquarium> {
    const response = await apiClient.put(`/aquariums/${id}`, { aquarium: data });
    return response.data;
  },

  // 水族館を削除
  async deleteAquarium(id: number): Promise<void> {
    await apiClient.delete(`/aquariums/${id}`);
  },

  // =====================
  // 写真アップロード（admin）
  // =====================

  // 写真を追加
  async uploadPhotos(aquariumId: number, photos: File[]): Promise<Aquarium> {
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('photos[]', photo);
    });

    const response = await apiClient.post(
      `/aquariums/${aquariumId}/upload_photos`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data;
  },

  // 写真を削除
  async deletePhoto(aquariumId: number, photoId: number): Promise<Aquarium> {
    const response = await apiClient.delete(
      `/aquariums/${aquariumId}/photos/${photoId}`
    );
    return response.data;
  },

  // ヘッダー写真を設定
  async setHeaderPhoto(aquariumId: number, photoId: number): Promise<Aquarium> {
    const response = await apiClient.put(
      `/aquariums/${aquariumId}/set_header_photo`,
      { photo_id: photoId }
    );
    return response.data;
  },

  // =====================
  // 検索・地図
  // =====================

  // 水族館を検索
  async searchAquariums(query: string, exhibit?: string): Promise<AquariumsResponse> {
    const response = await apiClient.get('/aquariums/search', {
      params: { q: query, exhibit },
    });
    return response.data;
  },

  // 近くの水族館を取得
  async getNearbyAquariums(
    lat: number,
    lng: number,
    distance?: number
  ): Promise<{ aquariums: Aquarium[] }> {
    const response = await apiClient.get('/aquariums/nearby', {
      params: { lat, lng, distance },
    });
    return response.data;
  },

  // =====================
  // ランキング
  // =====================

  // 訪問数ランキング
  async getMostVisitedRanking(params?: {
    period?: 'all' | 'year' | 'month';
    year?: number;
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/most_visited', { params });
    return response.data;
  },

  // 評価ランキング
  async getHighestRatedRanking(params?: {
    minVisits?: number;
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/highest_rated', { params });
    return response.data;
  },

  // トレンドランキング（最近人気）
  async getTrendingRanking(params?: {
    days?: number;
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/trending', { params });
    return response.data;
  },

  // 行きたいリストチャンピオン
  async getWishlistChampionsRanking(params?: {
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/wishlist_champions', { params });
    return response.data;
  },

  // 隠れた名所
  async getHiddenGemsRanking(params?: {
    minRating?: number;
    maxVisits?: number;
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/hidden_gems', { params });
    return response.data;
  },
};