// apps/web/src/app/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <BoltIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">EV Orchestrator</span>
                <div className="text-xs text-blue-400 font-medium">AI-Powered</div>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Smart EV charging orchestrator with AI-powered optimization, 
              predictive scheduling, and intelligent queue management.
            </p>
            <div className="text-sm text-gray-500">
              © 2025 EV Orchestrator. Built for the future of electric mobility.
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4">AI Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Smart Duration Prediction</li>
              <li>Dynamic Pricing</li>
              <li>Queue Optimization</li>
              <li>Personalized Recommendations</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>Made with ❤️ for sustainable transportation. Powered by AI.</p>
        </div>
      </div>
    </footer>
  );
}
