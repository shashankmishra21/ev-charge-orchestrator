// apps/api/src/types/index.ts
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  created_at: Date;
}

export interface Station {
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
  created_at: Date;
}

export interface StationWithAI extends Station {
  current_utilization: number;
  estimated_wait: string;
  availability_status: 'Available' | 'Moderate' | 'Busy';
  ai_recommendation: string;
  distance?: number;
}

export interface StationUtilization {
  id: number;
  station_id: number;
  date: Date;
  hour: number;
  utilization: number;
  avg_wait_time: number;
  total_sessions: number;
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
  created_at: Date;
}

export interface Booking {
  id: number;
  user_id: number;
  station_id: number;
  vehicle_id?: number;
  booking_date: Date;
  start_time: Date;
  duration_minutes: number;
  end_time: Date;
  predicted_duration: number;
  predicted_cost?: number;
  predicted_energy?: number;
  actual_start_time?: Date;
  actual_end_time?: Date;
  actual_energy_used?: number;
  actual_cost?: number;
  start_otp: string;
  end_otp: string;
  start_otp_used: boolean;
  end_otp_used: boolean;
  status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  booking_time: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TimeSlotPrediction {
  time: string;
  hour: number;
  predicted_utilization: number;
  availability: 'Available' | 'Moderate' | 'Busy';
  estimated_wait: string;
  dynamic_price: number;
}

export interface StationAIAnalysis {
  average_utilization: number;
  peak_hours: number[];
  best_time_today: {
    hour: number;
    utilization: number;
    message: string;
  };
  cost_savings_tip: string;
  time_slots_prediction: TimeSlotPrediction[];
}
