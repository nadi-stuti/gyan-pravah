'use client'

import { useEffect, useState } from 'react'
import { checkConnection } from '@/lib/quiz-api'

interface NoInternetConnectionProps {
  onRetry?: () => void
}

export default function NoInternetConnection({ onRetry }: NoInternetConnectionProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const isConnected = await checkConnection()
      if (isConnected && onRetry) {
        onRetry()
      }
    } catch (error) {
      console.error('Retry connection failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-card p-8 text-center">
        {/* No Internet Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-danger-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-12 h-12 text-danger-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M8.111 16.89A4.5 4.5 0 0115.889 9.11M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.635 2.25 12 6.615 2.25 12 2.25z" 
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          No Internet Connection
        </h1>

        {/* Description */}
        <p className="text-text-secondary mb-8 leading-relaxed">
          Gyan Pravah requires an internet connection to access the latest quiz questions and content. 
          Please check your connection and try again.
        </p>

        {/* Connection Tips */}
        <div className="bg-neutral-50 rounded-2xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-text-primary mb-3">Connection Tips:</h3>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              Check your WiFi or mobile data connection
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              Try moving to an area with better signal
            </li>
            <li className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              Restart your router or toggle airplane mode
            </li>
          </ul>
        </div>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-button hover:shadow-button-hover disabled:cursor-not-allowed"
        >
          {isRetrying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Checking Connection...
            </div>
          ) : (
            'Try Again'
          )}
        </button>

        {/* Alternative Actions */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-sm text-text-secondary mb-4">
            Still having trouble?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-text-primary font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => window.history.back()}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-text-primary font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check internet connectivity
export function useInternetConnection() {
  const [isOnline, setIsOnline] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  const checkInternetConnection = async () => {
    setIsChecking(true)
    try {
      const isConnected = await checkConnection()
      setIsOnline(isConnected)
      return isConnected
    } catch (error) {
      setIsOnline(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Check connection on mount
    checkInternetConnection()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      checkInternetConnection()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isChecking,
    checkConnection: checkInternetConnection
  }
}