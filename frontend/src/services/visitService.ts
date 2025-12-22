import apiClient from './api';
import { Visit, VisitForm } from '../types';

interface VisitsResponse {
  visits: Visit[];
  pagination?: {
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
    totalCount: number;
  };
}

export const visitService = {
  // 訪問記録一覧を取得
  async getVisits(params?: {
    aquariumId?: number;
    userId?: number;
    q?: string;
    sort?: 'date' | 'rating';
    page?: number;
    per?: number;
  }): Promise<Visit[]> {
    try {
      // Convert camelCase to snake_case for Rails API
      const apiParams: any = {};
      if (params?.aquariumId) apiParams.aquarium_id = params.aquariumId;
      if (params?.userId) apiParams.user_id = params.userId;
      if (params?.q) apiParams.q = params.q;
      if (params?.sort) apiParams.sort = params.sort;
      if (params?.page) apiParams.page = params.page;
      if (params?.per) apiParams.per = params.per;

      const response = await apiClient.get('/visits', { params: apiParams });
      console.log('API Response:', response.data);
      console.log('Visits array:', response.data.visits);
      return response.data.visits || response.data;
    } catch (error: any) {
      // 404エラー（データなし）の場合は空配列を返す
      if (error.response?.status === 404) {
        return [];
      }
      // 401エラー（認証エラー）の場合も一時的に空配列を返す
      if (error.response?.status === 401) {
        console.warn('認証エラー: ログインが必要です');
        return [];
      }
      // その他のエラーはそのまま投げる
      throw error;
    }
  },

  // 訪問記録詳細を取得
  async getVisit(id: number): Promise<Visit> {
    const response = await apiClient.get(`/visits/${id}`);
    return response.data;
  },

  // 訪問記録を作成
  async createVisit(data: VisitForm): Promise<Visit> {
    const formData = new FormData();

    // 基本情報
    formData.append('visit[aquarium_id]', data.aquariumId.toString());
    formData.append('visit[visited_at]', data.visitedAt);
    if (data.weather) formData.append('visit[weather]', data.weather);
    if (data.rating) formData.append('visit[rating]', data.rating.toString());
    if (data.memo) formData.append('visit[memo]', data.memo);

    // 良かった展示
    if (data.goodExhibitsList) {
      data.goodExhibitsList.forEach((exhibit) => {
        formData.append('visit[good_exhibits_list][]', exhibit);
      });
    }

    // 写真アップロード - params[:photos] として送る
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });
    }

    // 動画アップロード - params[:videos] として送る
    if (data.videos) {
      data.videos.forEach((video) => {
        formData.append('videos[]', video);
      });
    }

    const response = await apiClient.post('/visits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // 訪問記録を更新
  async updateVisit(id: number, data: Partial<VisitForm>): Promise<Visit> {
    const formData = new FormData();

    // 更新可能なフィールドのみ送信
    if (data.aquariumId !== undefined) formData.append('visit[aquarium_id]', data.aquariumId.toString());
    if (data.visitedAt !== undefined) formData.append('visit[visited_at]', data.visitedAt);
    if (data.weather !== undefined) formData.append('visit[weather]', data.weather || '');
    if (data.rating !== undefined) formData.append('visit[rating]', data.rating.toString());
    if (data.memo !== undefined) formData.append('visit[memo]', data.memo || '');

    if (data.goodExhibitsList !== undefined) {
      if (data.goodExhibitsList.length === 0) {
        // 空配列を送信する場合
        formData.append('visit[good_exhibits_list][]', '');
      } else {
        data.goodExhibitsList.forEach((exhibit) => {
          formData.append('visit[good_exhibits_list][]', exhibit);
        });
      }
    }

    // 写真アップロード（新しい写真がある場合）
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });
    }

    const response = await apiClient.put(`/visits/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // 訪問記録を削除
  async deleteVisit(id: number): Promise<void> {
    await apiClient.delete(`/visits/${id}`);
  },

  // 写真を追加
  async addPhotos(visitId: number, photos: File[]): Promise<Visit> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });

    const response = await apiClient.post(`/visits/${visitId}/upload_photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};