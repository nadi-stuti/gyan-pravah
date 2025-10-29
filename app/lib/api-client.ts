import { strapiClient } from './strapi'
import { 
  QuizQuestion, 
  QuizTopic, 
  QuizSubtopic,
  StrapiError
} from '@gyan-pravah/types'

// Enhanced API client with error handling and retry logic
export class EnhancedAPIClient {
  private static instance: EnhancedAPIClient
  private retryAttempts = 3
  private retryDelay = 1000

  static getInstance(): EnhancedAPIClient {
    if (!EnhancedAPIClient.instance) {
      EnhancedAPIClient.instance = new EnhancedAPIClient()
    }
    return EnhancedAPIClient.instance
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = this.retryAttempts
  ): Promise<T> {
    let lastError: Error | StrapiError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error | StrapiError
        
        console.warn(`${context} - Attempt ${attempt}/${maxRetries} failed:`, error)

        // Don't retry on certain error types
        if (this.shouldNotRetry(error)) {
          throw error
        }

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          break
        }

        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  private shouldNotRetry(error: any): boolean {
    // Don't retry on authentication errors, not found, etc.
    if ('status' in error) {
      const status = error.status
      return status === 401 || status === 403 || status === 404
    }
    return false
  }

  // Enhanced methods with retry logic
  async getQuestions(filters: any = {}): Promise<QuizQuestion[]> {
    return this.withRetry(
      () => strapiClient.getQuestions(filters),
      'getQuestions'
    )
  }

  async getTopics(filters: any = {}): Promise<QuizTopic[]> {
    return this.withRetry(
      () => strapiClient.getTopics(filters),
      'getTopics'
    )
  }

  async getSubtopics(filters: any = {}): Promise<QuizSubtopic[]> {
    return this.withRetry(
      () => strapiClient.getSubtopics(filters),
      'getSubtopics'
    )
  }

  async getRandomQuestions(
    count: number = 5, 
    mode: 'normal' | 'expert' | 'first-visit' = 'normal'
  ): Promise<QuizQuestion[]> {
    return this.withRetry(
      () => strapiClient.getRandomQuestions(count, mode),
      'getRandomQuestions'
    )
  }

  async getSubtopicAvailability(): Promise<Record<string, { questionCount: number; hasQuestions: boolean }>> {
    return this.withRetry(
      () => strapiClient.getSubtopicAvailability(),
      'getSubtopicAvailability'
    )
  }

  async getAvailableSubtopics(): Promise<QuizSubtopic[]> {
    return this.withRetry(
      () => strapiClient.getAvailableSubtopics(),
      'getAvailableSubtopics'
    )
  }

  async getAvailableSubtopicsForTopic(topicSlug: string): Promise<QuizSubtopic[]> {
    return this.withRetry(
      () => strapiClient.getAvailableSubtopicsForTopic(topicSlug),
      'getAvailableSubtopicsForTopic'
    )
  }

  async getTopicsWithAvailability(): Promise<Array<QuizTopic & { hasAvailableSubtopics: boolean; availableSubtopicCount: number }>> {
    return this.withRetry(
      () => strapiClient.getTopicsWithAvailability(),
      'getTopicsWithAvailability'
    )
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await strapiClient.healthCheck()
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  // Connection status checking
  async checkConnectionStatus(): Promise<{
    isOnline: boolean
    isServerReachable: boolean
    error?: StrapiError | Error
  }> {
    // Check basic connectivity
    const isOnline = navigator.onLine

    if (!isOnline) {
      return {
        isOnline: false,
        isServerReachable: false,
        error: {
          status: 0,
          name: 'NetworkError',
          message: 'No internet connection detected'
        }
      }
    }

    // Check server reachability
    try {
      const isServerReachable = await this.healthCheck()
      return {
        isOnline: true,
        isServerReachable,
        error: isServerReachable ? undefined : {
          status: 503,
          name: 'ServiceUnavailable',
          message: 'Server is not reachable'
        }
      }
    } catch (error) {
      return {
        isOnline: true,
        isServerReachable: false,
        error: error as StrapiError | Error
      }
    }
  }
}

// Export singleton instance
export const apiClient = EnhancedAPIClient.getInstance()

// Convenience functions that use the enhanced client
export const getQuestions = (filters?: any) => apiClient.getQuestions(filters)
export const getTopics = (filters?: any) => apiClient.getTopics(filters)
export const getSubtopics = (filters?: any) => apiClient.getSubtopics(filters)
export const getAvailableSubtopics = () => apiClient.getAvailableSubtopics()
export const getAvailableSubtopicsForTopic = (topicSlug: string) => apiClient.getAvailableSubtopicsForTopic(topicSlug)
export const getTopicsWithAvailability = () => apiClient.getTopicsWithAvailability()
export const getRandomQuestions = (count?: number, mode?: 'normal' | 'expert' | 'first-visit') => 
  apiClient.getRandomQuestions(count, mode)
export const getSubtopicAvailability = () => apiClient.getSubtopicAvailability()
export const checkConnectionStatus = () => apiClient.checkConnectionStatus()

// Error handling utilities
export function isNetworkError(error: any): boolean {
  return error?.name === 'NetworkError' || error?.status === 0
}

export function isTimeoutError(error: any): boolean {
  return error?.name === 'TimeoutError' || error?.status === 408
}

export function isServerError(error: any): boolean {
  return error?.status >= 500
}

export function getErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred'
  
  if (isNetworkError(error)) {
    return 'Please check your internet connection'
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again'
  }
  
  if (isServerError(error)) {
    return 'Server error. Please try again later'
  }
  
  return error.message || 'Something went wrong'
}

export function shouldShowRetry(error: any): boolean {
  // Don't show retry for authentication or not found errors
  if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
    return false
  }
  
  return true
}