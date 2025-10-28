'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import LoadingScreen from './LoadingScreen'
import RetryHandler from './RetryHandler'
import { LoadingSkeleton } from './LoadingSkeleton'
import { StrapiError } from '@gyan-pravah/types'

interface AsyncWrapperProps {
  isLoading: boolean
  error?: StrapiError | Error | null
  onRetry?: () => Promise<void>
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  skeletonComponent?: ReactNode
  children: ReactNode
  loadingMessage?: string
  className?: string
  showSkeleton?: boolean
  minHeight?: string
}

export default function AsyncWrapper({
  isLoading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  skeletonComponent,
  children,
  loadingMessage = 'Loading...',
  className = '',
  showSkeleton = false,
  minHeight = 'min-h-[200px]'
}: AsyncWrapperProps) {
  return (
    <div className={`${minHeight} ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {showSkeleton && skeletonComponent ? (
              skeletonComponent
            ) : loadingComponent ? (
              loadingComponent
            ) : (
              <LoadingScreen message={loadingMessage} />
            )}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {errorComponent ? (
              errorComponent
            ) : onRetry ? (
              <RetryHandler onRetry={onRetry} error={error} />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 mb-4 bg-red-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <p className="text-gray-600 font-poppins">
                  {error.message || 'Something went wrong'}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Specialized async wrappers
export function QuizAsyncWrapper({
  isLoading,
  error,
  onRetry,
  children,
  className = ''
}: Omit<AsyncWrapperProps, 'loadingMessage' | 'skeletonComponent'>) {
  return (
    <AsyncWrapper
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingMessage="Loading quiz..."
      className={className}
      minHeight="min-h-[400px]"
    >
      {children}
    </AsyncWrapper>
  )
}

export function DataAsyncWrapper({
  isLoading,
  error,
  onRetry,
  children,
  showSkeleton = true,
  skeletonComponent,
  className = ''
}: Omit<AsyncWrapperProps, 'loadingMessage'>) {
  return (
    <AsyncWrapper
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingMessage="Loading data..."
      showSkeleton={showSkeleton}
      skeletonComponent={skeletonComponent || <LoadingSkeleton height={100} />}
      className={className}
      minHeight="min-h-[200px]"
    >
      {children}
    </AsyncWrapper>
  )
}

export function PageAsyncWrapper({
  isLoading,
  error,
  onRetry,
  children,
  className = ''
}: Omit<AsyncWrapperProps, 'loadingMessage' | 'minHeight'>) {
  return (
    <AsyncWrapper
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      loadingMessage="Loading page..."
      className={className}
      minHeight="min-h-screen"
    >
      {children}
    </AsyncWrapper>
  )
}

// Hook for managing async wrapper state
export function useAsyncWrapper() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<StrapiError | Error | null>(null)

  const execute = async <T,>(asyncFunction: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setIsLoading(false)
      return result
    } catch (err) {
      setError(err as StrapiError | Error)
      setIsLoading(false)
      return null
    }
  }

  const retry = async <T,>(asyncFunction: () => Promise<T>): Promise<T | null> => {
    setError(null)
    return execute(asyncFunction)
  }

  const reset = () => {
    setIsLoading(false)
    setError(null)
  }

  return {
    isLoading,
    error,
    execute,
    retry,
    reset
  }
}