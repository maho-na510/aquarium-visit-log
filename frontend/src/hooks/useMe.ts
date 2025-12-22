import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';

export type MeResponse = {
  user: {
    id: number;
    name: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    avatar_url?: string;
    avatarUrl?: string;
  };
};

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiClient.get<MeResponse>('/me');
      return res.data;
    },
    staleTime: 60_000,
  });
}
