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

  // 水族館を検索
  async searchAquariums(query: string, exhibit?: string): Promise<AquariumsResponse> {
    const response = await apiClient.get('/aquariums/search', {
      params: { q: query, exhibit }
    });
    return response.data;
  },

  // 近くの水族館を取得
  async getNearbyAquariums(lat: number, lng: number, distance?: number): Promise<{ aquariums: Aquarium[] }> {
    const response = await apiClient.get('/aquariums/nearby', {
      params: { lat, lng, distance }
    });
    return response.data;
  },

  // 訪問数ランキングを取得
  async getMostVisitedRanking(params?: {
    period?: 'all' | 'year' | 'month';
    year?: number;
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/most_visited', { params });
    return response.data;
  },

  // 評価ランキングを取得
  async getHighestRatedRanking(params?: {
    minVisits?: number;
    prefecture?: string;
    limit?: number;
  }): Promise<RankingsResponse> {
    const response = await apiClient.get('/rankings/highest_rated', { params });
    return response.data;
  }
};