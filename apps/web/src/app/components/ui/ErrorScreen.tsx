// apps/web/src/app/components/ui/ErrorScreen.tsx
'use client';

import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorScreen({ 
  error, 
  onRetry, 
  showRetry = true 
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md mx-4">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
        </div>

        {/* Error Content */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Oops! Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {error}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Home
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-4">
          If the problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
