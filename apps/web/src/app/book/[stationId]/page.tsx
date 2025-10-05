// apps/web/src/app/book/[stationId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '../../components/layout/Header';
import LoadingScreen from '../../components/ui/LoadingScreen';
import ErrorScreen from '../../components/ui/ErrorScreen';
import VehicleSelector from '../../components/booking/VehicleSelector';
import TimeSlotPicker from '../../components/booking/TimeSlotPicker';
import DurationSelector from '../../components/booking/DurationSelector';
import BookingConfirmation from '../../components/booking/BookingConfirmation';
import { stationAPI, vehicleAPI, StationWithAI, Vehicle } from '../../lib/api';
import { ArrowLeftIcon, BoltIcon } from '@heroicons/react/24/outline';

interface BookingPageProps {
  params: { stationId: string };
}

export default function BookingPage({ params }: BookingPageProps) {
  const [station, setStation] = useState<StationWithAI | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    fetchData();
  }, [session, params.stationId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stationResponse, vehiclesResponse] = await Promise.all([
        stationAPI.getById(parseInt(params.stationId)),
        vehicleAPI.getAll()
      ]);

      if (stationResponse.data.success && stationResponse.data.data) {
        setStation(stationResponse.data.data);
      }

      if (vehiclesResponse.data.success && vehiclesResponse.data.data) {
        setVehicles(vehiclesResponse.data.data);
        // Auto-select primary vehicle
        const primaryVehicle = vehiclesResponse.data.data.find(v => v.is_primary);
        if (primaryVehicle) {
          setSelectedVehicle(primaryVehicle);
        }
      }
    } catch (error) {
      setError('Failed to load booking data');
      console.error('Error fetching booking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return selectedVehicle !== null;
      case 2: return selectedDate !== '' && selectedTime !== '';
      case 3: return selectedDuration > 0;
      default: return false;
    }
  };

  if (loading) return <LoadingScreen message="Loading booking details..." />;
  if (error) return <ErrorScreen error={error} onRetry={fetchData} />;
  if (!station) return <ErrorScreen error="Station not found" showRetry={false} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Charging Slot</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <BoltIcon className="h-5 w-5" />
              <span>{station.name}</span>
              <span>•</span>
              <span>{station.address}</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="grid grid-cols-4 gap-4 mb-8 text-center">
          <div className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
            Select Vehicle
          </div>
          <div className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
            Choose Time
          </div>
          <div className={`text-sm font-medium ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
            Select Duration
          </div>
          <div className={`text-sm font-medium ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-500'}`}>
            Confirm Booking
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {currentStep === 1 && (
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={setSelectedVehicle}
              station={station}
            />
          )}

          {currentStep === 2 && (
            <TimeSlotPicker
              station={station}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
            />
          )}

          {currentStep === 3 && (
            <DurationSelector
              station={station}
              vehicle={selectedVehicle!}
              selectedDuration={selectedDuration}
              onDurationSelect={setSelectedDuration}
            />
          )}

          {currentStep === 4 && (
            <BookingConfirmation
              station={station}
              vehicle={selectedVehicle!}
              date={selectedDate}
              time={selectedTime}
              duration={selectedDuration}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            onClick={handleNextStep}
            disabled={!canProceedToNext() || currentStep === 4}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === 4 ? 'Completed' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
