// apps/web/src/app/lib/constants.ts
export const VEHICLE_MAKES = [
  'Tesla',
  'Tata',
  'MG',
  'Hyundai',
  'BMW',
  'Audi',
  'Mahindra',
  'BYD',
  'Other'
];

export const CHARGING_CURVE_TYPES = [
  { value: 'fast', label: 'Fast Charging' },
  { value: 'standard', label: 'Standard' },
  { value: 'slow', label: 'Slow Charging' }
];

export const CHARGER_TYPES = [
  'CCS',
  'CHAdeMO', 
  'Type2',
  'Tesla Supercharger'
];

export const VEHICLE_PRESETS = {
  'Tesla Model 3': {
    battery_capacity: 75,
    max_charging_power: 170,
    vehicle_range: 500,
    charging_efficiency: 0.92,
    charging_curve_type: 'fast'
  },
  'Tata Nexon EV': {
    battery_capacity: 30.2,
    max_charging_power: 50,
    vehicle_range: 312,
    charging_efficiency: 0.85,
    charging_curve_type: 'standard'
  },
  'MG ZS EV': {
    battery_capacity: 44.5,
    max_charging_power: 50,
    vehicle_range: 419,
    charging_efficiency: 0.88,
    charging_curve_type: 'standard'
  },
  'Hyundai Kona': {
    battery_capacity: 39.2,
    max_charging_power: 77,
    vehicle_range: 452,
    charging_efficiency: 0.89,
    charging_curve_type: 'fast'
  }
};

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30'
];

export const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes', price_multiplier: 1.0 },
  { value: 60, label: '1 hour', price_multiplier: 1.0 },
  { value: 90, label: '1.5 hours', price_multiplier: 0.95 },
  { value: 120, label: '2 hours', price_multiplier: 0.9 },
  { value: 180, label: '3 hours', price_multiplier: 0.85 },
];
