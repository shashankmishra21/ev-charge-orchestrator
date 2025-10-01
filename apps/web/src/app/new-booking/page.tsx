'use client';

import Navbar from '@/components/Navbar';

export default function NewBookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">📅 New Booking</h1>
          <p className="text-gray-600">Coming Soon!</p>
        </div>
      </div>
    </div>
  );
}
