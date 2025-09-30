import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',

    },
});

//Station API calls
export const stationAPI = {
    //get all stations
    getAll: () => api.get('/api/stations'),

    //get api by id
    getById: (id: number) => api.get(`/api/staions/${id}`)
}

//types for api response 
export interface Station{
    id: number,
    name: string,
    address: string,
    total_slots: number,
    price_per_kwh : string,
    is_active : boolean,
    available_slots: number
}

export interface ApiResponse<T> {
  success: boolean;
  stations?: T;
  error?: string;
}