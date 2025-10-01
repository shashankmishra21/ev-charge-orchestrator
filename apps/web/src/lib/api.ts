import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Add authentication interceptor
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession(); // Get current session
      if (session?.user?.email) {
        config.headers.Authorization = session.user.email;
        // Optional: Also send user info
        config.headers['X-User-Email'] = session.user.email;
        config.headers['X-User-Name'] = session.user.name || '';
      }
    } catch (error) {
      console.error('Failed to get session:', error);
    }
  }
  return config;
});

// Handle API response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      console.error('Authentication failed, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Station API calls
export const stationAPI = {
    // Get all stations
    getAll: () => api.get('/api/stations'),
    
    // Get station by id (fixed typo: staions -> stations)
    getById: (id: number) => api.get(`/api/stations/${id}`)
};

// Types for API responses 
export interface Station {
    id: number;
    name: string;
    address: string;
    total_slots: number;
    price_per_kwh: string;
    is_active: boolean;
    available_slots: number;
}

export interface ApiResponse<T> {
  success: boolean;
  stations?: T;
  vehicles?: T; // Add vehicles for vehicle API responses
  error?: string;
}

// Vehicle interface
export interface Vehicle {
  id?: number;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate?: string;
  batteryCapacity: number;
  isPrimary: boolean;
  createdAt?: string;
}

// Vehicle API functions (fixed paths - added /api prefix)
export const vehicleAPI = {
  getAll: () => api.get('/api/vehicles'),
  create: (vehicleData: Omit<Vehicle, 'id' | 'createdAt'>) => api.post('/api/vehicles', vehicleData),
  update: (id: number, vehicleData: Partial<Vehicle>) => api.put(`/api/vehicles/${id}`, vehicleData),
  delete: (id: number) => api.delete(`/api/vehicles/${id}`),
  setPrimary: (id: number) => api.put(`/api/vehicles/${id}/primary`)
};

export default api;
