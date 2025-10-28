'use client'

import { useState, useCallback } from 'react'
import { StrapiError } from '@gyan-pravah/types'
import { 
  isNetworkError, 
  isTimeoutError, 
  isServerError, 
  getErrorMessage,
  shouldShowRetry 
} from '@/lib/api-client'

interface ErrorState {
  error: StrapiError | Error | null
  isLoading: boolean
  retryCount: number
}

interface UseErrorHandlingOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: StrapiError | Error) => void
  onSuccess?: () => void
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess
  } = options

  const [state, setState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0
  })

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await asyncFunction()
      setState(prev => ({ ...prev, isLoading: false, retryCount: 0 }))
      onSuccess?.()
      return result
    } catch (error) {
      const errorObj = error as StrapiError | Error
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorObj,
        retryCount: prev.retryCount + 1
      }))
      onError?.(errorObj)
      return null
    }
  }, [onError, onSuccess])

  const retry = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    if (state.retryCount >= maxRetries) {
      return null
    }

    // Add delay before retry
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }

    return executeWithErrorHandling(asyncFunction)
  }, [state.retryCount, maxRetries, retryDelay, executeWithErrorHandling])

  const reset = useCallback(() => {
    setState({
      error: null,
      isLoading: false,
      retryCount: 0
    })
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    execute: executeWithErrorHandling,
    retry,
    reset,
    clearError,
    canRetry: state.retryCount < maxRetries && shouldShowRetry(state.error),
    errorMessage: getErrorMessage(state.error),
    isNetworkError: isNetworkError(state.error),
    isTimeoutError: isTimeoutError(state.error),
    isServerError: isServerError(state.error)
  }
}

// Specialized hooks for different contexts
export function useQuizErrorHandling() {
  return useErrorHandling({
    maxRetries: 3,
    retryDelay: 2000,
    onError: (error) => {
      console.error('Quiz error:', error)
      // Could add analytics tracking here
    }
  })
}

export function useDataErrorHandling() {
  return useErrorHandling({
    maxRetries: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Data loading error:', error)
    }
  })
}

export function useNetworkErrorHandling() {
  return useErrorHandling({
    maxRetries: 5,
    retryDelay: 3000,
    onError: (error) => {
      console.error('Network error:', error)
    }
  })
}