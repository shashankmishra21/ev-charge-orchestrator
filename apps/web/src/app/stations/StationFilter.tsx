// apps/web/src/app/components/stations/StationFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { StationWithAI } from '../../lib/api';

interface StationFiltersProps {
  stations: StationWithAI[];
  onFilter: (filtered: StationWithAI[]) => void;
}

export default function StationFilters({ stations, onFilter }: StationFiltersProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'moderate' | 'busy'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'power' | 'availability'>('distance');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [powerFilter, setPowerFilter] = useState<'all' | 'slow' | 'fast' | 'rapid'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25]);

  useEffect(() => {
    applyFilters();
  }, [filter, sortBy, powerFilter, priceRange, stations]);

  const applyFilters = () => {
    let filtered = [...stations];

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(station => 
        station.availability_status.toLowerCase() === filter
      );
    }

    // Power filter
    if (powerFilter !== 'all') {
      filtered = filtered.filter(station => {
        if (powerFilter === 'slow') return station.charging_power <= 25;
        if (powerFilter === 'fast') return station.charging_power > 25 && station.charging_power <= 75;
        if (powerFilter === 'rapid') return station.charging_power > 75;
        return true;
      });
    }

    // Price range filter
    filtered = filtered.filter(station => 
      station.price_per_kwh >= priceRange[0] && station.price_per_kwh <= priceRange[1]
    );

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price':
          return a.price_per_kwh - b.price_per_kwh;
        case 'power':
          return b.charging_power - a.charging_power;
        case 'availability':
          return a.current_utilization - b.current_utilization;
        default:
          return 0;
      }
    });

    onFilter(filtered);
  };

  const getStatsForStatus = (status: string) => {
    return stations.filter(s => s.availability_status === status).length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
      {/* Main Filters */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                {getStatsForStatus('Available')} Available
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                {getStatsForStatus('Moderate')} Moderate
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                {getStatsForStatus('Busy')} Busy
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                AI-Optimized
              </span>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Stations</option>
                <option value="available">Available</option>
                <option value="moderate">Moderate</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="distance">Sort by Distance</option>
                <option value="price">Sort by Price</option>
                <option value="power">Sort by Power</option>
                <option value="availability">Sort by Availability</option>
              </select>
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showAdvanced 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Power Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charging Power
              </label>
              <select
                value={powerFilter}
                onChange={(e) => setPowerFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Power Levels</option>
                <option value="slow">Slow (≤25kW)</option>
                <option value="fast">Fast (25-75kW)</option>
                <option value="rapid">Rapid (>75kW)</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₹/kWh)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 min-w-[60px]">
                  ₹0-{priceRange[1]}
                </span>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('all');
                  setSortBy('distance');
                  setPowerFilter('all');
                  setPriceRange([0, 25]);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
