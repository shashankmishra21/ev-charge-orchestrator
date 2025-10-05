// apps/web/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { 
  BoltIcon, 
  SparklesIcon, 
  ChartBarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStations: 5,
    availableNow: 3,
    avgSavings: 25
  });

  const handleGetStarted = () => {
    if (session) {
      router.push('/stations');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 transform rotate-12">
                  <BoltIcon className="h-12 w-12 text-white transform -rotate-12" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-yellow-800" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Smart EV Charging
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Orchestrator
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered charging station management with predictive scheduling, 
              dynamic pricing, and intelligent queue optimization.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {session ? 'Find Stations' : 'Get Started'}
              </button>
              
              <button
                onClick={() => router.push('/stations')}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
              >
                Explore Stations
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStations}</div>
                <div className="text-gray-600">Active Stations</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.availableNow}</div>
                <div className="text-gray-600">Available Now</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.avgSavings}%</div>
                <div className="text-gray-600">Avg AI Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Artificial Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI orchestrator optimizes every aspect of your charging experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<SparklesIcon className="h-8 w-8" />}
              title="Smart Duration Prediction"
              description="AI predicts optimal charging time based on your vehicle and current battery level"
              color="blue"
            />
            
            <FeatureCard
              icon={<CurrencyRupeeIcon className="h-8 w-8" />}
              title="Dynamic Pricing"
              description="Real-time pricing optimization based on demand, time, and grid conditions"
              color="green"
            />
            
            <FeatureCard
              icon={<ClockIcon className="h-8 w-8" />}
              title="Queue Prediction"
              description="LSTM models predict wait times and suggest optimal charging windows"
              color="purple"
            />
            
            <FeatureCard
              icon={<ChartBarIcon className="h-8 w-8" />}
              title="Smart Recommendations"
              description="Personalized suggestions based on your charging patterns and preferences"
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, intelligent, and efficient charging in just a few steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              title="Find & Select"
              description="Browse AI-optimized stations with real-time availability and smart recommendations"
              icon={<MapPinIcon className="h-8 w-8" />}
            />
            
            <StepCard
              step={2}
              title="AI Optimization"
              description="Our AI predicts optimal charging duration, cost, and suggests the best time slots"
              icon={<SparklesIcon className="h-8 w-8" />}
            />
            
            <StepCard
              step={3}
              title="Smart Charging"
              description="Enjoy optimized charging with predictive queue management and dynamic pricing"
              icon={<BoltIcon className="h-8 w-8" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Smart Charging?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of EV drivers who save time and money with our AI-powered platform
          </p>
          
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {session ? 'Start Charging Smart' : 'Sign Up Now'}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'indigo';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200'
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({ step, title, description, icon }: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
          {step}
        </div>
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-600">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
