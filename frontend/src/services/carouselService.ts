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
  title: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const carouselService = {
  // Público
  getCarouselImages: async (): Promise<CarouselImage[]> => {
    const response = await api.get('/carousel');
    return response.data;
  },
  
  // Admin
  getAllCarouselImages: async (): Promise<CarouselImage[]> => {
    const response = await api.get('/carousel/admin');
    return response.data;
  },
  
  addCarouselImage: async (imageData: { imageUrl: string; title: string; order: number }): Promise<CarouselImage> => {
    const response = await api.post('/carousel', imageData);
    return response.data;
  },
  
  updateCarouselImage: async (id: string, imageData: Partial<CarouselImage>): Promise<CarouselImage> => {
    const response = await api.put(`/carousel/${id}`, imageData);
    return response.data;
  },
  
  deleteCarouselImage: async (id: string): Promise<void> => {
    await api.delete(`/carousel/${id}`);
  },
  
  initializeDefaultImages: async (): Promise<void> => {
    await api.post('/carousel/initialize');
  },
};