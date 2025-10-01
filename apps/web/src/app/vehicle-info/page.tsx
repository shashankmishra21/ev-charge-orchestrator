'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { vehicleAPI, Vehicle } from '@/lib/api';

// Popular EV models for auto-suggestions
const popularEVs = {
  Tata: [
    { model: 'Nexon EV', capacity: 30.2 },
    { model: 'Nexon EV Max', capacity: 40.5 },
    { model: 'Tigor EV', capacity: 26.0 }
  ],
  MG: [
    { model: 'ZS EV', capacity: 44.5 },
    { model: 'Comet EV', capacity: 17.3 }
  ],
  Tesla: [
    { model: 'Model 3', capacity: 75.0 },
    { model: 'Model S', capacity: 100.0 },
    { model: 'Model X', capacity: 100.0 }
  ],
  Hyundai: [
    { model: 'Kona Electric', capacity: 39.2 },
    { model: 'IONIQ 5', capacity: 72.6 }
  ],
  BYD: [
    { model: 'Atto 3', capacity: 60.5 },
    { model: 'e6', capacity: 71.7 }
  ],
  Mahindra: [
    { model: 'XUV400 EV', capacity: 39.4 },
    { model: 'eVerito', capacity: 21.2 }
  ]
};

export default function VehicleInfoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Vehicle, 'id' | 'createdAt'>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    batteryCapacity: 0,
    isPrimary: false
  });

  const [availableModels, setAvailableModels] = useState<Array<{model: string, capacity: number}>>([]);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchVehicles();
    }
  }, [status, router]);

  // Update available models when make changes
  useEffect(() => {
    if (formData.make && popularEVs[formData.make as keyof typeof popularEVs]) {
      setAvailableModels(popularEVs[formData.make as keyof typeof popularEVs]);
    } else {
      setAvailableModels([]);
    }
  }, [formData.make]);

  // API Functions
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await vehicleAPI.getAll();
      
      if (response.data.success) {
        setVehicles(response.data.vehicles);
      } else {
        setError('Failed to fetch vehicles');
      }
    } catch (err: any) {
      setError('Unable to connect to server');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeChange = (make: string) => {
    setFormData(prev => ({
      ...prev,
      make,
      model: '',
      batteryCapacity: 0
    }));
  };

  const handleModelChange = (model: string) => {
    const selectedModel = availableModels.find(m => m.model === model);
    if (selectedModel) {
      setFormData(prev => ({
        ...prev,
        model,
        batteryCapacity: selectedModel.capacity
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      licensePlate: '',
      batteryCapacity: 0,
      isPrimary: false
    });
    setShowAddForm(false);
    setEditingVehicle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      if (editingVehicle) {
        await vehicleAPI.update(editingVehicle.id!, formData);
      } else {
        await vehicleAPI.create(formData);
      }
      
      await fetchVehicles();
      resetForm();
      
    } catch (error: any) {
      console.error('Failed to save vehicle:', error);
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || '',
      licensePlate: vehicle.licensePlate || '',
      batteryCapacity: vehicle.batteryCapacity,
      isPrimary: vehicle.isPrimary
    });
    setShowAddForm(true);
  };

  const handleDelete = async (vehicleId: number) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleAPI.delete(vehicleId);
        await fetchVehicles();
      } catch (error: any) {
        console.error('Failed to delete vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const setPrimary = async (vehicleId: number) => {
    try {
      await vehicleAPI.setPrimary(vehicleId);
      await fetchVehicles();
    } catch (error: any) {
      console.error('Failed to set primary vehicle:', error);
      alert('Failed to set primary vehicle. Please try again.');
    }
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!session) {
    return null;
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
            <button 
              onClick={fetchVehicles}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚗 Vehicle Information
          </h1>
          <p className="text-gray-600">
            Manage your electric vehicles for seamless charging bookings
          </p>
        </div>

        {/* Add Vehicle Button */}
        {!showAddForm && (
          <div className="mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span className="text-xl">➕</span>
              <span>Add New Vehicle</span>
            </button>
          </div>
        )}

        {/* Add/Edit Vehicle Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVehicle ? '✏️ Edit Vehicle' : '🚗 Add New Vehicle'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Vehicle Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Make *
                  </label>
                  <select
                    required
                    value={formData.make}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Make</option>
                    {Object.keys(popularEVs).map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model *
                  </label>
                  <select
                    required
                    value={formData.model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={!formData.make}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Model</option>
                    {availableModels.map(model => (
                      <option key={model.model} value={model.model}>
                        {model.model} ({model.capacity} kWh)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Battery Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Battery Capacity (kWh) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="200"
                    required
                    value={formData.batteryCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, batteryCapacity: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 40.5"
                  />
                </div>

                {/* Color (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Red, Blue, White"
                  />
                </div>

                {/* License Plate (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., KA01AB1234"
                  />
                </div>
              </div>

              {/* Primary Vehicle Checkbox */}
              {vehicles.length > 0 && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                    Set as primary vehicle (for quick booking selection)
                  </label>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 
                    (editingVehicle ? 'Updating...' : 'Adding...') : 
                    (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')
                  }
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles List */}
        {vehicles.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your Vehicles ({vehicles.length})
            </h2>
            
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🚗</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <p className="text-gray-600">{vehicle.year}</p>
                        {vehicle.color && (
                          <p className="text-sm text-gray-500">Color: {vehicle.color}</p>
                        )}
                      </div>
                      {vehicle.isPrimary && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          ⭐ Primary
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                        title="Edit Vehicle"
                      >
                        ✏️
                      </button>
                      {!vehicle.isPrimary && (
                        <button
                          onClick={() => setPrimary(vehicle.id!)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                          title="Set as Primary"
                        >
                          ⭐
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(vehicle.id!)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                        title="Delete Vehicle"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-xs">Battery Capacity</span>
                      <div className="font-bold text-gray-900">{vehicle.batteryCapacity} kWh</div>
                    </div>
                    
                    {vehicle.licensePlate && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-500 text-xs">License Plate</span>
                        <div className="font-bold text-gray-900">{vehicle.licensePlate}</div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-500 text-xs">Estimated Range</span>
                      <div className="font-bold text-gray-900">~{Math.round(vehicle.batteryCapacity * 4)} km</div>
                    </div>
                  </div>

                  {vehicle.createdAt && (
                    <div className="mt-4 text-xs text-gray-500">
                      Added on {new Date(vehicle.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : !showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Vehicles Added</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Add your first electric vehicle to get started with smart charging bookings. 
              We'll remember your vehicle details for future bookings.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
