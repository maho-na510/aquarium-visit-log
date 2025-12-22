import apiClient from './api';
import { User } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  name: string;
  username: string;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  favoriteAquariumIds?: number[];
}

export const userService = {
  // ユーザー登録
  async register(data: RegisterData): Promise<{ user: User }> {
    const response = await apiClient.post('/register', {
      user: {
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        name: data.name,
        username: data.username,
      },
    });
    return response.data;
  },

  // ユーザー情報取得
  async getUser(userId: number): Promise<User> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // ユーザー情報更新
  async updateUser(userId: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${userId}`, {
      user: {
        name: data.name,
        username: data.username,
        favorite_aquarium_ids: data.favoriteAquariumIds,
      },
    });
    return response.data;
  },

  // アバター画像アップロード
  async uploadAvatar(userId: number, file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post(`/users/${userId}/upload_avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ユーザーの訪問記録一覧
  async getUserVisits(userId: number, params?: { page?: number; per?: number }) {
    const response = await apiClient.get(`/users/${userId}/visits`, { params });
    return response.data;
  },

  // ユーザーのウィッシュリスト
  async getUserWishlist(userId: number, params?: { page?: number; per?: number }) {
    const response = await apiClient.get(`/users/${userId}/wishlist`, { params });
    return response.data;
  },
};
