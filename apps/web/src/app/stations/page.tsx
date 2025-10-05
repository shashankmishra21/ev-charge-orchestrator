// apps/web/src/app/stations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '../components/layout/Header';
import StationCard from '../components/stations/StationCard';
import StationFilters from '../components/stations/StationFilter';
import LoadingScreen from '../components/ui/LoadingScreen';
import ErrorScreen from '../components/ui/ErrorScreen';
import { stationAPI, StationWithAI } from '../lib/api';

export default function StationsPage() {
  const [stations, setStations] = useState<StationWithAI[]>([]);
  const [filteredStations, setFilteredStations] = useState<StationWithAI[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetchStations();
    getUserLocation();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await stationAPI.getAll();
      if (response.data.success && response.data.data) {
        setStations(response.data.data);
        setFilteredStations(response.data.data);
      }
    } catch (error) {
      setError('Failed to load stations');
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          
          // Calculate distances for all stations
          setStations(prev => prev.map(station => ({
            ...station,
            distance: calculateDistance(location, station)
          })));
        },
        (error) => {
          console.log('Location access denied, using default Delhi location');
          const defaultLocation = { latitude: 28.6139, longitude: 77.2090 };
          setUserLocation(defaultLocation);
          
          setStations(prev => prev.map(station => ({
            ...station,
            distance: calculateDistance(defaultLocation, station)
          })));
        }
      );
    }
  };

  const calculateDistance = (userLoc: {latitude: number, longitude: number}, station: StationWithAI): number => {
    const R = 6371;
    const dLat = (station.latitude - userLoc.latitude) * Math.PI / 180;
    const dLon = (station.longitude - userLoc.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(userLoc.latitude * Math.PI / 180) * 
             Math.cos(station.latitude * Math.PI / 180) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10;
  };

  if (loading) return <LoadingScreen message="Loading charging stations..." />;
  if (error) return <ErrorScreen error={error} onRetry={fetchStations} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EV Charging Stations</h1>
          <p className="text-gray-600">AI-powered smart charging network</p>
        </div>

        <StationFilters 
          stations={stations}
          onFilter={setFilteredStations}
        />

        {/* Stations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStations.map(station => (
            <StationCard 
              key={station.id} 
              station={station}
              onBook={() => router.push(`/book/${station.id}`)}
            />
          ))}
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stations found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
