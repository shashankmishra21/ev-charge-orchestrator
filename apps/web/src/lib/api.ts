// apps/web/src/app/lib/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Add authentication interceptor
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session?.user?.email) {
        config.headers.Authorization = session.user.email;
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
      console.error('Authentication failed, redirecting to login');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Updated Types to match backend
export interface StationWithAI {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  total_slots: number;
  price_per_kwh: number;
  charging_power: number;
  charger_type: string;
  efficiency_rating: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
  current_utilization: number;
  estimated_wait: string;
  availability_status: 'Available' | 'Moderate' | 'Busy';
  ai_recommendation: string;
  distance?: number;
}

export interface Vehicle {
  id: number;
  user_id: number;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate?: string;
  battery_capacity: number;
  charging_efficiency: number;
  max_charging_power: number;
  vehicle_range: number;
  charging_curve_type: string;
  is_primary: boolean;
  created_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Updated API calls
export const stationAPI = {
  getAll: (): Promise<{ data: APIResponse<StationWithAI[]> }> => api.get('/api/stations'),
  getById: (id: number): Promise<{ data: APIResponse<StationWithAI> }> => api.get(`/api/stations/${id}`)
};

export const vehicleAPI = {
  getAll: (): Promise<{ data: APIResponse<Vehicle[]> }> => api.get('/api/vehicles'),
  create: (vehicleData: Partial<Vehicle>): Promise<{ data: APIResponse<Vehicle> }> => 
    api.post('/api/vehicles', vehicleData),
  setPrimary: (id: number): Promise<{ data: APIResponse<Vehicle> }> => 
    api.put(`/api/vehicles/${id}/primary`)
};

export default api;
