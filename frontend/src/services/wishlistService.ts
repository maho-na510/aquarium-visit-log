import apiClient from './api';
import { WishlistItem } from '../types';

interface WishlistItemsResponse {
  wishlistItems: WishlistItem[];  // Changed to camelCase because axios interceptor converts it
  pagination?: {
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
    totalCount: number;
  };
}

interface WishlistItemForm {
  aquariumId: number;
  priority?: number;
  memo?: string;
}

export const wishlistService = {
  // Get all wishlist items
  async getWishlistItems(params?: {
    page?: number;
    per?: number;
  }): Promise<WishlistItem[]> {
    try {
      const response = await apiClient.get<WishlistItemsResponse>('/wishlist_items', { params });
      return response.data.wishlistItems || [];  // Changed to camelCase
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Get a single wishlist item
  async getWishlistItem(id: number): Promise<WishlistItem> {
    const response = await apiClient.get(`/wishlist_items/${id}`);
    return response.data;
  },

  // Add to wishlist
  async addToWishlist(data: WishlistItemForm): Promise<WishlistItem> {
    const response = await apiClient.post('/wishlist_items', {
      wishlist_item: {
        aquarium_id: data.aquariumId,
        priority: data.priority,
        memo: data.memo,
      },
    });
    return response.data;
  },

  // Update wishlist item
  async updateWishlistItem(id: number, data: Partial<WishlistItemForm>): Promise<WishlistItem> {
    const response = await apiClient.put(`/wishlist_items/${id}`, {
      wishlist_item: {
        aquarium_id: data.aquariumId,
        priority: data.priority,
        memo: data.memo,
      },
    });
    return response.data;
  },

  // Remove from wishlist
  async removeFromWishlist(id: number): Promise<void> {
    await apiClient.delete(`/wishlist_items/${id}`);
  },
};
