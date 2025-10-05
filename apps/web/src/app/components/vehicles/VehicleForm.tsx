// apps/web/src/app/components/vehicles/VehicleForm.tsx
'use client';

import { useState } from 'react';
import { XMarkIcon, TruckIcon } from '@heroicons/react/24/outline';
import { vehicleAPI, Vehicle } from '../../lib/api';
import { VEHICLE_MAKES, CHARGING_CURVE_TYPES } from '../../lib/constants';

interface VehicleFormProps {
  onSuccess: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

export default function VehicleForm({ onSuccess, onCancel }: VehicleFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    license_plate: '',
    battery_capacity: 0,
    charging_efficiency: 0.90,
    max_charging_power: 50,
    vehicle_range: 400,
    charging_curve_type: 'standard',
    is_primary: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await vehicleAPI.create(formData);
      if (response.data.success && response.data.data) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               value
    }));
  };

  // Predefined vehicle data for common models
  const vehiclePresets = {
    'Tesla Model 3': { battery_capacity: 75, max_charging_power: 170, vehicle_range: 500, charging_efficiency: 0.92 },
    'Tata Nexon EV': { battery_capacity: 30.2, max_charging_power: 50, vehicle_range: 312, charging_efficiency: 0.85 },
    'MG ZS EV': { battery_capacity: 44.5, max_charging_power: 50, vehicle_range: 419, charging_efficiency: 0.88 },
    'Hyundai Kona': { battery_capacity: 39.2, max_charging_power: 77, vehicle_range: 452, charging_efficiency: 0.89 }
  };

  const handlePresetSelect = (preset: string) => {
    if (vehiclePresets[preset as keyof typeof vehiclePresets]) {
      const presetData = vehiclePresets[preset as keyof typeof vehiclePresets];
      setFormData(prev => ({
        ...prev,
        ...presetData,
        model: preset.split(' ').slice(1).join(' '),
        make: preset.split(' ')[0]
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <TruckIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Add Vehicle</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(vehiclePresets).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="p-2 text-sm border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make *
              </label>
              <select
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Make</option>
                {VEHICLE_MAKES.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g., Model 3, Nexon EV"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="2010"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., White, Blue"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              License Plate
            </label>
            <input
              type="text"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              placeholder="e.g., KA01AB1234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>

          {/* Technical Specifications */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Battery Capacity (kWh) *
                </label>
                <input
                  type="number"
                  name="battery_capacity"
                  value={formData.battery_capacity}
                  onChange={handleChange}
                  required
                  min="10"
                  max="200"
                  step="0.1"
                  placeholder="e.g., 75.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Charging Power (kW)
                </label>
                <input
                  type="number"
                  name="max_charging_power"
                  value={formData.max_charging_power}
                  onChange={handleChange}
                  min="10"
                  max="350"
                  placeholder="e.g., 50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Range (km)
                </label>
                <input
                  type="number"
                  name="vehicle_range"
                  value={formData.vehicle_range}
                  onChange={handleChange}
                  min="100"
                  max="1000"
                  placeholder="e.g., 400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charging Efficiency (0.1 - 1.0)
                </label>
                <input
                  type="number"
                  name="charging_efficiency"
                  value={formData.charging_efficiency}
                  onChange={handleChange}
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  placeholder="e.g., 0.90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charging Curve Type
              </label>
              <select
                name="charging_curve_type"
                value={formData.charging_curve_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CHARGING_CURVE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Vehicle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Set as primary vehicle
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
