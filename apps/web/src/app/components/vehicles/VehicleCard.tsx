// apps/web/src/app/components/vehicles/VehicleCard.tsx
'use client';

import { StarIcon, BoltIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Vehicle } from '../../lib/api';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSetPrimary: () => void;
}

export default function VehicleCard({ vehicle, onSetPrimary }: VehicleCardProps) {
  const getVehicleEmoji = (make: string) => {
    const makeMap: { [key: string]: string } = {
      'Tesla': '🚗',
      'Tata': '🚙',
      'MG': '🚐',
      'Hyundai': '🚗',
      'BMW': '🚗',
      'Audi': '🚗',
      'default': '🚗'
    };
    return makeMap[make] || makeMap.default;
  };

  const getBatteryColor = (capacity: number) => {
    if (capacity >= 70) return 'text-green-600';
    if (capacity >= 40) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getEfficiencyRating = (efficiency: number) => {
    if (efficiency >= 0.9) return { rating: 'Excellent', color: 'text-green-600' };
    if (efficiency >= 0.85) return { rating: 'Very Good', color: 'text-blue-600' };
    if (efficiency >= 0.8) return { rating: 'Good', color: 'text-yellow-600' };
    return { rating: 'Average', color: 'text-gray-600' };
  };

  const efficiencyInfo = getEfficiencyRating(vehicle.charging_efficiency);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      vehicle.is_primary ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getVehicleEmoji(vehicle.make)}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-600">{vehicle.year}</p>
            </div>
          </div>
          
          <button
            onClick={onSetPrimary}
            className={`p-2 rounded-lg transition-colors ${
              vehicle.is_primary 
                ? 'text-yellow-500 bg-yellow-50' 
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
            title={vehicle.is_primary ? 'Primary Vehicle' : 'Set as Primary'}
          >
            {vehicle.is_primary ? (
              <StarIconSolid className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {vehicle.is_primary && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium inline-block mb-4">
            Primary Vehicle
          </div>
        )}

        {/* Vehicle Details */}
        <div className="space-y-3">
          {vehicle.color && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Color:</span>
              <span className="text-sm font-medium text-gray-900">{vehicle.color}</span>
            </div>
          )}
          
          {vehicle.license_plate && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">License Plate:</span>
              <span className="text-sm font-medium text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                {vehicle.license_plate}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Technical Specs */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Technical Specifications</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <BoltIcon className={`h-4 w-4 ${getBatteryColor(vehicle.battery_capacity)}`} />
                <span className="text-xs text-gray-600">Battery</span>
              </div>
              <div className={`text-sm font-medium ${getBatteryColor(vehicle.battery_capacity)}`}>
                {vehicle.battery_capacity} kWh
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-600">Max Power</div>
              <div className="text-sm font-medium text-gray-900">
                {vehicle.max_charging_power} kW
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-600">Range</div>
              <div className="text-sm font-medium text-gray-900">
                {vehicle.vehicle_range} km
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-600">Efficiency</div>
              <div className={`text-sm font-medium ${efficiencyInfo.color}`}>
                {efficiencyInfo.rating}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Charging Type:</span>
              <span className="text-xs font-medium text-gray-900 capitalize">
                {vehicle.charging_curve_type}
              </span>
            </div>
          </div>
        </div>

        {/* Added Date */}
        <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
          <CalendarIcon className="h-3 w-3 mr-1" />
          Added {new Date(vehicle.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
