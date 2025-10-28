import { StrapiError } from '@gyan-pravah/types'

export interface ErrorReport {
  error: StrapiError | Error
  context: string
  timestamp: Date
  userAgent: string
  url: string
  userId?: string
}

class ErrorService {
  private static instance: ErrorService
  private errorQueue: ErrorReport[] = []
  private maxQueueSize = 50

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  // Log error with context
  logError(error: StrapiError | Error, context: string = 'Unknown') {
    const errorReport: ErrorReport = {
      error,
      context,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      url: typeof window !== 'undefined' ? window.location.href : 'Server'
    }

    // Add to queue
    this.errorQueue.push(errorReport)
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${context}`)
      console.error('Error:', error)
      console.log('Context:', context)
      console.log('Timestamp:', errorReport.timestamp.toISOString())
      console.log('URL:', errorReport.url)
      console.groupEnd()
    }

    // In production, you might want to send to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorTracking(errorReport)
    }
  }

  // Get error statistics
  getErrorStats() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentErrors = this.errorQueue.filter(report => report.timestamp > oneHourAgo)
    const dailyErrors = this.errorQueue.filter(report => report.timestamp > oneDayAgo)

    const errorsByContext = this.errorQueue.reduce((acc, report) => {
      acc[report.context] = (acc[report.context] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: this.errorQueue.length,
      lastHour: recentErrors.length,
      lastDay: dailyErrors.length,
      byContext: errorsByContext,
      mostRecentError: this.errorQueue[this.errorQueue.length - 1]
    }
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = []
  }

  // Get recent errors
  getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errorQueue.slice(-limit).reverse()
  }

  // Check if error is critical
  isCriticalError(error: StrapiError | Error): boolean {
    if ('status' in error) {
      // Server errors are critical
      return error.status >= 500
    }
    
    // Network errors are critical
    if ('name' in error && error.name === 'NetworkError') {
      return true
    }

    return false
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: StrapiError | Error): string {
    if ('name' in error) {
      switch (error.name) {
        case 'NetworkError':
          return 'Please check your internet connection and try again.'
        case 'TimeoutError':
          return 'The request took too long. Please try again.'
        default:
          break
      }
    }

    if ('status' in error) {
      switch (error.status) {
        case 400:
          return 'Invalid request. Please check your input.'
        case 401:
          return 'Authentication required. Please log in.'
        case 403:
          return 'You do not have permission to access this resource.'
        case 404:
          return 'The requested resource was not found.'
        case 429:
          return 'Too many requests. Please wait a moment and try again.'
        case 500:
          return 'Server error. Please try again later.'
        case 503:
          return 'Service temporarily unavailable. Please try again later.'
        default:
          if (error.status >= 500) {
            return 'Server error. Please try again later.'
          }
          break
      }
    }

    return error.message || 'An unexpected error occurred. Please try again.'
  }

  // Send error to tracking service (placeholder)
  private async sendToErrorTracking(errorReport: ErrorReport) {
    try {
      // In a real app, you would send this to a service like Sentry, LogRocket, etc.
      // For now, we'll just store it locally or send to PostHog
      
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('error_occurred', {
          error_message: errorReport.error.message,
          error_name: 'name' in errorReport.error ? errorReport.error.name : 'Unknown',
          error_status: 'status' in errorReport.error ? errorReport.error.status : undefined,
          context: errorReport.context,
          url: errorReport.url,
          timestamp: errorReport.timestamp.toISOString()
        })
      }
    } catch (trackingError) {
      console.error('Failed to send error to tracking service:', trackingError)
    }
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance()

// Convenience functions
export function logError(error: StrapiError | Error, context: string = 'Unknown') {
  errorService.logError(error, context)
}

export function getUserFriendlyMessage(error: StrapiError | Error): string {
  return errorService.getUserFriendlyMessage(error)
}

export function isCriticalError(error: StrapiError | Error): boolean {
  return errorService.isCriticalError(error)
}

// Error boundary integration
export function handleComponentError(error: Error, errorInfo: React.ErrorInfo, componentName: string) {
  const contextualError = {
    ...error,
    componentStack: errorInfo.componentStack,
    errorBoundary: componentName
  }
  
  logError(contextualError, `Component: ${componentName}`)
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      new Error(event.reason?.message || 'Unhandled promise rejection'),
      'Unhandled Promise Rejection'
    )
  })

  // Global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    logError(
      new Error(event.message),
      `Uncaught Error: ${event.filename}:${event.lineno}`
    )
  })
}