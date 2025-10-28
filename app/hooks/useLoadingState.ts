'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface LoadingState {
  isLoading: boolean
  loadingMessage?: string
  progress?: number
}

interface UseLoadingStateOptions {
  initialMessage?: string
  minLoadingTime?: number // Minimum time to show loading (prevents flashing)
  timeout?: number // Maximum loading time before showing error
  onTimeout?: () => void
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    initialMessage = 'Loading...',
    minLoadingTime = 500,
    timeout = 30000,
    onTimeout
  } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: initialMessage
  })

  const startTimeRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback((message?: string) => {
    startTimeRef.current = Date.now()
    setState({
      isLoading: true,
      loadingMessage: message || initialMessage,
      progress: undefined
    })

    // Set timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        onTimeout?.()
      }, timeout)
    }
  }, [initialMessage, timeout, onTimeout])

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      loadingMessage: message || prev.loadingMessage
    }))
  }, [])

  const updateMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      loadingMessage: message
    }))
  }, [])

  const stopLoading = useCallback(async () => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Ensure minimum loading time
    if (startTimeRef.current && minLoadingTime > 0) {
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed))
      }
    }

    setState({
      isLoading: false,
      loadingMessage: initialMessage,
      progress: undefined
    })
    startTimeRef.current = null
  }, [minLoadingTime, initialMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    startLoading,
    stopLoading,
    updateProgress,
    updateMessage
  }
}

// Specialized loading hooks
export function useQuizLoading() {
  return useLoadingState({
    initialMessage: 'Loading quiz...',
    minLoadingTime: 800,
    timeout: 15000
  })
}

export function useDataLoading() {
  return useLoadingState({
    initialMessage: 'Loading data...',
    minLoadingTime: 300,
    timeout: 10000
  })
}

export function usePageLoading() {
  return useLoadingState({
    initialMessage: 'Loading page...',
    minLoadingTime: 200,
    timeout: 20000
  })
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({})

  const startLoading = useCallback((key: string, message?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        loadingMessage: message || 'Loading...'
      }
    }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }, [])

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress,
        loadingMessage: message || prev[key]?.loadingMessage || 'Loading...'
      }
    }))
  }, [])

  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading)
  const loadingCount = Object.values(loadingStates).filter(state => state.isLoading).length

  return {
    loadingStates,
    startLoading,
    stopLoading,
    updateProgress,
    isAnyLoading,
    loadingCount,
    clearAll: () => setLoadingStates({})
  }
}