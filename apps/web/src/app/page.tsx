'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-16 pb-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              ⚡ Smart EV Charging
              <span className="block text-blue-600 mt-2">Made Simple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
              Book charging slots, manage your vehicles, and power up your EV journey 
              with our intelligent AI-powered platform
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {session ? (
                <>
                  <Link
                    href="/stations"
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    ⚡ Browse Stations
                  </Link>
                  <Link
                    href="/new-booking"
                    className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    📅 Quick Booking
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🚀 Get Started Free
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
            <div className="text-5xl mb-6">🧠</div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">AI-Powered Booking</h3>
            <p className="text-gray-600 leading-relaxed">
              Smart recommendations for optimal charging times, stations, and duration based on your patterns
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
            <div className="text-5xl mb-6">📍</div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">5 Premium Stations</h3>
            <p className="text-gray-600 leading-relaxed">
              High-speed charging stations across the city with real-time availability and competitive pricing
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
            <div className="text-5xl mb-6">💳</div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Seamless Payments</h3>
            <p className="text-gray-600 leading-relaxed">
              Secure Stripe integration, transparent pricing at ₹150/hour, no hidden fees or surprises
            </p>
          </div>
        </div>

        {/* User Dashboard - Only if logged in */}
        {session && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user?.name?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-600">Here's your charging overview</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Active Bookings</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Completed Sessions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
                <div className="text-sm text-gray-600">Vehicles Saved</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-1">₹0</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/stations"
                className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">⚡</span>
                <div>
                  <div className="font-bold text-gray-900">Browse Stations</div>
                  <div className="text-sm text-gray-600">Find nearby charging stations</div>
                </div>
              </Link>

              <Link
                href="/vehicle-info"
                className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🚗</span>
                <div>
                  <div className="font-bold text-gray-900">Manage Vehicles</div>
                  <div className="text-sm text-gray-600">Add your EV information</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {!session && (
          <div className="text-center mb-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Charging Smarter?</h2>
              <p className="text-blue-100 mb-6">Join thousands of EV owners who trust our platform</p>
              <Link
                href="/auth/signin"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                Sign In with Google →
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-2xl mb-4">⚡ EV Orchestrator</div>
            <p className="text-gray-400 mb-4">
              Making electric vehicle charging simple, smart, and accessible for everyone.
            </p>
            <p className="text-sm text-gray-500">
              © 2025 EV Orchestrator. Built with ❤️ for sustainable transportation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
