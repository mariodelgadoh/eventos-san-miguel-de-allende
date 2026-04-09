import axios from 'axios';

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

export interface CarouselImage {
  _id: string;
  imageUrl: string;
  filename?: string;
  title: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const carouselService = {
  // Público - siempre devuelve un array
  getCarouselImages: async (): Promise<CarouselImage[]> => {
    try {
      const response = await api.get('/carousel');
      // Asegurar que siempre devuelve un array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        return [response.data];
      }
      return [];
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      return [];
    }
  },
  
  // Admin
  getAllCarouselImages: async (): Promise<CarouselImage[]> => {
    try {
      const response = await api.get('/carousel/admin');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all carousel images:', error);
      return [];
    }
  },
  
  addCarouselImage: async (formData: FormData): Promise<CarouselImage> => {
    const response = await api.post('/carousel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  updateCarouselImage: async (id: string, formData: FormData): Promise<CarouselImage> => {
    const response = await api.put(`/carousel/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  deleteCarouselImage: async (id: string): Promise<void> => {
    await api.delete(`/carousel/${id}`);
  },
  
  initializeDefaultImages: async (): Promise<void> => {
    await api.post('/carousel/initialize');
  },
};