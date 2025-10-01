'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { stationAPI, Station } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function StationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchStations();
    }
  }, [status, router]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationAPI.getAll();
      
      if (response.data.success) {
        setStations(response.data.stations);
      } else {
        setError('Failed to fetch stations');
      }
    } catch (err) {
      setError('Unable to connect to server');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
            <button 
              onClick={fetchStations}
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚡ Charging Stations
          </h1>
          <p className="text-gray-600">
            Find and book charging slots at premium stations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <div key={station.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {station.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    station.available_slots > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {station.available_slots > 0 ? 'Available' : 'Full'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">📍 {station.address}</p>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Slots:</span> {station.available_slots}/{station.total_slots}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">₹{station.price_per_kwh}/kWh</span>
                  </div>
                </div>

                <button 
                  disabled={station.available_slots === 0}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    station.available_slots > 0
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {station.available_slots > 0 ? 'Book Slot' : 'No Slots Available'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>📊 Showing {stations.length} charging stations</p>
        </div>
      </main>
    </div>
  );
}
