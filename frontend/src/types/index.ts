export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'visitor';
  token?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type Category = 'Cultura' | 'Música' | 'Gastronomía' | 'Arte' | 'Deporte';

export interface Event {
  _id: string;
  name: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  images: string[];
  date: string;
  category: Category;
  organizer: User;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  event: string;
  user: User;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Favorite {
  _id: string;
  user: string;
  event: Event;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'visitor';
  token: string;
}

export interface ApiError {
  message: string;
  error?: string;
}