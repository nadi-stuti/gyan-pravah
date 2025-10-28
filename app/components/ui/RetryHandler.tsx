'use client'

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import Button from './Button'
import { StrapiError } from '@gyan-pravah/types'

interface RetryHandlerProps {
  onRetry: () => Promise<void>
  error?: StrapiError | Error | null
  maxRetries?: number
  retryDelay?: number
  className?: string
  children?: React.ReactNode
}

export default function RetryHandler({
  onRetry,
  error,
  maxRetries = 3,
  retryDelay = 1000,
  className = '',
  children
}: RetryHandlerProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) return

    setIsRetrying(true)
    
    try {
      // Add delay before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
      
      await onRetry()
      setRetryCount(0) // Reset on success
    } catch (error) {
      setRetryCount(prev => prev + 1)
      console.error(`Retry attempt ${retryCount + 1} failed:`, error)
    } finally {
      setIsRetrying(false)
    }
  }, [onRetry, retryCount, maxRetries, retryDelay])

  const getErrorMessage = () => {
    if (!error) return 'An unexpected error occurred'
    
    if ('message' in error) {
      return error.message
    }
    
    return 'Something went wrong'
  }

  const getErrorType = () => {
    if (!error) return 'unknown'
    
    if ('name' in error) {
      switch (error.name) {
        case 'NetworkError':
          return 'network'
        case 'TimeoutError':
          return 'timeout'
        default:
          return 'api'
      }
    }
    
    return 'unknown'
  }

  const getRetryMessage = () => {
    const errorType = getErrorType()
    
    switch (errorType) {
      case 'network':
        return 'Check your internet connection and try again'
      case 'timeout':
        return 'The request timed out. Please try again'
      case 'api':
        return 'There was a server error. Please try again'
      default:
        return 'Please try again'
    }
  }

  const canRetry = retryCount < maxRetries && !isRetrying

  if (!error) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-12 h-12 mb-4 bg-red-400 rounded-full flex items-center justify-center"
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </motion.div>

      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2 mb-6"
      >
        <h3 className="text-lg font-poppins font-semibold text-gray-800">
          {getErrorMessage()}
        </h3>
        
        <p className="text-gray-600 font-poppins text-sm">
          {getRetryMessage()}
        </p>

        {retryCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500"
          >
            Attempt {retryCount} of {maxRetries}
          </motion.p>
        )}
      </motion.div>

      {/* Retry Button */}
      {canRetry ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleRetry}
            isLoading={isRetrying}
            variant="primary"
            className="min-w-[120px]"
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <p className="text-sm text-gray-500 font-poppins">
            Maximum retry attempts reached
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              className="min-w-[120px]"
            >
              Refresh Page
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="min-w-[120px]"
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Hook for retry logic
export function useRetry(
  asyncFunction: () => Promise<void>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const executeWithRetry = useCallback(async () => {
    setIsRetrying(true)
    setError(null)

    try {
      await asyncFunction()
      setRetryCount(0) // Reset on success
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        
        // Auto-retry with delay
        setTimeout(() => {
          executeWithRetry()
        }, retryDelay)
      }
    } finally {
      setIsRetrying(false)
    }
  }, [asyncFunction, retryCount, maxRetries, retryDelay])

  const reset = useCallback(() => {
    setRetryCount(0)
    setError(null)
    setIsRetrying(false)
  }, [])

  return {
    execute: executeWithRetry,
    reset,
    retryCount,
    isRetrying,
    error,
    canRetry: retryCount < maxRetries && !isRetrying
  }
}

// Specialized retry components
export function NetworkRetryHandler({ 
  onRetry, 
  error, 
  className = '' 
}: Omit<RetryHandlerProps, 'maxRetries' | 'retryDelay'>) {
  return (
    <RetryHandler
      onRetry={onRetry}
      error={error}
      maxRetries={5}
      retryDelay={2000}
      className={className}
    />
  )
}

export function QuickRetryHandler({ 
  onRetry, 
  error, 
  className = '' 
}: Omit<RetryHandlerProps, 'maxRetries' | 'retryDelay'>) {
  return (
    <RetryHandler
      onRetry={onRetry}
      error={error}
      maxRetries={2}
      retryDelay={500}
      className={className}
    />
  )
}