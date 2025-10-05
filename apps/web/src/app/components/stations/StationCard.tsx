// apps/web/src/app/components/stations/StationCard.tsx
'use client';

import { 
  MapPinIcon, 
  BoltIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StationWithAI } from '../../lib/api';

interface StationCardProps {
  station: StationWithAI;
  onBook: () => void;
}

export default function StationCard({ station, onBook }: StationCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Busy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPowerBadgeColor = (power: number) => {
    if (power >= 100) return 'bg-purple-100 text-purple-800';
    if (power >= 50) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 30) return 'text-green-600';
    if (utilization < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {station.name}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">{station.address}</span>
            </div>
            {station.distance && (
              <p className="text-blue-600 font-medium text-sm">📏 {station.distance} km away</p>
            )}
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(station.availability_status)}`}>
            {station.availability_status}
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getPowerBadgeColor(station.charging_power)}`}>
              ⚡ {station.charging_power}kW
            </div>
            <span className="text-xs text-gray-500">{station.charger_type}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">₹{station.price_per_kwh}/kWh</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Slots:</span>
            <span className="text-sm font-medium">🔋 {station.total_slots}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Efficiency:</span>
            <span className="text-sm font-medium">{Math.round(station.efficiency_rating * 100)}%</span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">AI Insights</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getUtilizationColor(station.current_utilization)}`}>
                {station.current_utilization}%
              </div>
              <div className="text-xs text-blue-600">Current Load</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-blue-800">Wait Time:</span>
            <span className="font-medium text-blue-900">{station.estimated_wait}</span>
          </div>
          
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-blue-800 leading-relaxed">
              🤖 {station.ai_recommendation}
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {station.amenities.slice(0, 4).map((amenity, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
            {station.amenities.length > 4 && (
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                +{station.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Book Button */}
      <div className="px-6 pb-6">
        <button
          onClick={onBook}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
        >
          <span>Book Charging Slot</span>
          <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
