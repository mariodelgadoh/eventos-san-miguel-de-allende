import axios from 'axios';
import { Event, Comment, User, AuthResponse, Favorite } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (name: string, email: string, password: string, role?: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      return {
        ...userData,
        createdAt: userData.createdAt || new Date().toISOString(),
        isBlocked: userData.isBlocked || false
      };
    }
    return null;
  },
};

export const eventService = {
  getEvents: async (params?: { search?: string; category?: string; featured?: boolean; type?: string }) => {
    const response = await api.get<Event[]>('/events', { params });
    return response.data;
  },
  getEventById: async (id: string) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },
  createEvent: async (eventData: any) => {
    const response = await api.post<Event>('/events', eventData);
    return response.data;
  },
  updateEvent: async (id: string, eventData: Partial<Event>) => {
    const response = await api.put<Event>(`/events/${id}`, eventData);
    return response.data;
  },
  deleteEvent: async (id: string) => {
    await api.delete(`/events/${id}`);
  },
  toggleFeatured: async (id: string) => {
    const response = await api.patch<Event>(`/events/${id}/featured`);
    return response.data;
  },
};

export const commentService = {
  getComments: async (eventId: string) => {
    const response = await api.get<Comment[]>(`/comments/${eventId}`);
    return response.data;
  },
  addComment: async (eventId: string, content: string, rating: number) => {
    const response = await api.post<Comment>(`/comments/${eventId}`, { content, rating });
    return response.data;
  },
};

export const favoriteService = {
  getFavorites: async () => {
    const response = await api.get<Favorite[]>('/favorites');
    return response.data;
  },
  addFavorite: async (eventId: string) => {
    const response = await api.post<Favorite>(`/favorites/${eventId}`);
    return response.data;
  },
  removeFavorite: async (eventId: string) => {
    await api.delete(`/favorites/${eventId}`);
  },
};

export const adminService = {
  getAllUsers: async () => {
    const response = await api.get<any[]>('/admin/users');
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  blockUser: async (userId: string, reason: string) => {
    const response = await api.patch(`/admin/users/${userId}/block`, { reason });
    return response.data;
  },
  unblockUser: async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/unblock`);
    return response.data;
  },
  deleteUser: async (userId: string) => {
    await api.delete(`/admin/users/${userId}`);
  },
  updateUserRole: async (userId: string, role: string) => {
    const response = await api.patch<User>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
};