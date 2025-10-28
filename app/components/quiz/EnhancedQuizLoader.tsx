'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { QuizQuestion } from '@gyan-pravah/types'
import { 
  useErrorHandling, 
  useLoadingState,
  ErrorBoundary,
  AsyncWrapper,
  QuestionCardSkeleton,
  logError
} from '../ui'
import { apiClient } from '@/lib/api-client'
import NoInternetConnection from '../NoInternetConnection'

interface EnhancedQuizLoaderProps {
  topicSlug?: string
  subtopicSlug?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  mode?: 'normal' | 'expert' | 'first-visit'
  questionCount?: number
  onQuestionsLoaded: (questions: QuizQuestion[]) => void
  onError?: (error: any) => void
  children?: React.ReactNode
}

export default function EnhancedQuizLoader({
  topicSlug,
  subtopicSlug,
  difficulty,
  mode = 'normal',
  questionCount = 5,
  onQuestionsLoaded,
  onError,
  children
}: EnhancedQuizLoaderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [connectionStatus, setConnectionStatus] = useState<{
    isOnline: boolean
    isServerReachable: boolean
    error?: any
  } | null>(null)

  const {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    updateMessage,
    updateProgress
  } = useLoadingState({
    initialMessage: 'Preparing your quiz...',
    minLoadingTime: 1000,
    timeout: 20000,
    onTimeout: () => {
      handleError(new Error('Quiz loading timed out. Please try again.'))
    }
  })

  const {
    error,
    execute,
    retry,
    reset,
    canRetry,
    errorMessage,
    isNetworkError
  } = useErrorHandling({
    maxRetries: 3,
    retryDelay: 2000,
    onError: (error) => {
      logError(error, 'EnhancedQuizLoader')
      onError?.(error)
    }
  })

  // Load questions
  const loadQuestions = async () => {
    startLoading('Checking connection...')
    
    // First check connection status
    const status = await apiClient.checkConnectionStatus()
    setConnectionStatus(status)
    
    if (!status.isOnline) {
      throw new Error('No internet connection detected')
    }
    
    if (!status.isServerReachable) {
      throw status.error || new Error('Server is not reachable')
    }

    updateMessage('Loading quiz questions...')
    updateProgress(25)

    let questionsData: QuizQuestion[]

    if (topicSlug || subtopicSlug || difficulty) {
      // Load specific questions
      updateMessage('Finding questions for your selection...')
      questionsData = await apiClient.getQuestions({
        topic: topicSlug,
        subtopic: subtopicSlug,
        difficulty,
        limit: questionCount * 2 // Get more for randomization
      })
      
      // Shuffle and limit
      questionsData = questionsData
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount)
    } else {
      // Load random questions
      updateMessage('Selecting random questions...')
      questionsData = await apiClient.getRandomQuestions(questionCount, mode)
    }

    updateProgress(75)

    if (questionsData.length === 0) {
      throw new Error('No questions found for the selected criteria')
    }

    if (questionsData.length < questionCount) {
      console.warn(`Only ${questionsData.length} questions found, expected ${questionCount}`)
    }

    updateMessage('Finalizing quiz setup...')
    updateProgress(100)

    setQuestions(questionsData)
    onQuestionsLoaded(questionsData)
    
    await stopLoading()
  }

  // Initial load
  useEffect(() => {
    execute(loadQuestions)
  }, [topicSlug, subtopicSlug, difficulty, mode, questionCount])

  const handleRetry = async () => {
    reset()
    setConnectionStatus(null)
    await retry(loadQuestions)
  }

  const handleError = (error: any) => {
    logError(error, 'QuizLoader')
    onError?.(error)
  }

  // Show no internet connection screen for network errors
  if (isNetworkError || (connectionStatus && !connectionStatus.isOnline)) {
    return <NoInternetConnection onRetry={handleRetry} />
  }

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
        >
          <div className="w-16 h-16 mb-6 bg-red-400 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
            </svg>
          </div>
          
          <h2 className="text-xl font-poppins font-semibold text-gray-800 mb-4">
            Quiz Loading Error
          </h2>
          
          <p className="text-gray-600 font-poppins mb-6">
            There was a problem setting up your quiz. Please try again.
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-[#8B7FC8] hover:bg-[#6B5FA8] text-white font-poppins font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Restart Quiz
          </button>
        </motion.div>
      }
    >
      <AsyncWrapper
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        loadingMessage={loadingMessage}
        showSkeleton={true}
        skeletonComponent={<QuestionCardSkeleton />}
        minHeight="min-h-[500px]"
      >
        {children || (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <div className="w-16 h-16 mb-4 bg-green-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-poppins font-semibold text-gray-800 mb-2">
              Quiz Ready!
            </h3>
            
            <p className="text-gray-600 font-poppins">
              {questions.length} questions loaded successfully
            </p>
          </motion.div>
        )}
      </AsyncWrapper>
    </ErrorBoundary>
  )
}

// Hook for using the enhanced quiz loader
export function useEnhancedQuizLoader() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<any>(null)

  const handleQuestionsLoaded = (loadedQuestions: QuizQuestion[]) => {
    setQuestions(loadedQuestions)
    setIsReady(true)
    setError(null)
  }

  const handleError = (error: any) => {
    setError(error)
    setIsReady(false)
  }

  const reset = () => {
    setQuestions([])
    setIsReady(false)
    setError(null)
  }

  return {
    questions,
    isReady,
    error,
    handleQuestionsLoaded,
    handleError,
    reset
  }
}