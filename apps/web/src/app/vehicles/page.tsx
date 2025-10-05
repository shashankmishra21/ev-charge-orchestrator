// apps/web/src/app/vehicles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleForm from '../components/vehicles/VehicleForm';
import LoadingScreen from '../components/ui/LoadingScreen';
import ErrorScreen from '../components/ui/ErrorScreen';
import { vehicleAPI, Vehicle } from '../lib/api';
import { PlusIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchVehicles();
  }, [session, router]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      if (response.data.success && response.data.data) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      setError('Failed to load vehicles');
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleAdded = (newVehicle: Vehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
    setShowForm(false);
  };

  const handleSetPrimary = async (vehicleId: number) => {
    try {
      await vehicleAPI.setPrimary(vehicleId);
      // Update local state
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        is_primary: vehicle.id === vehicleId
      })));
    } catch (error) {
      console.error('Error setting primary vehicle:', error);
    }
  };

  if (loading) return <LoadingScreen message="Loading your vehicles..." />;
  if (error) return <ErrorScreen error={error} onRetry={fetchVehicles} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Vehicles</h1>
            <p className="text-gray-600">Manage your electric vehicles and charging preferences</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Vehicle Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSetPrimary={() => handleSetPrimary(vehicle.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles added yet</h3>
              <p className="text-gray-600 mb-6">Add your first electric vehicle to get started with smart charging</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Your First Vehicle
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Form Modal */}
        {showForm && (
          <VehicleForm
            onSuccess={handleVehicleAdded}
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}
