'use client'

import { useEffect, useState } from 'react'
import { useErrorHandling } from '@/hooks/useErrorHandling'
import { useLoadingState } from '@/hooks/useLoadingState'
import { apiClient } from '@/lib/api-client'
import { logError } from '@/lib/error-service'
import AsyncWrapper from './AsyncWrapper'
import { TopicCardSkeleton, SubtopicListSkeleton, GridSkeleton } from './LoadingSkeleton'
import ErrorBoundary from './ErrorBoundary'
import type { QuizTopic, QuizSubtopic } from '@gyan-pravah/types'

interface EnhancedDataLoaderProps {
  children: (data: {
    topics: QuizTopic[]
    subtopics: QuizSubtopic[]
    availability: Record<string, { questionCount: number; hasQuestions: boolean }>
    isLoading: boolean
    error: any
    retry: () => void
  }) => React.ReactNode
}

export default function EnhancedDataLoader({ children }: EnhancedDataLoaderProps) {
  const {
    error: topicsError,
    isLoading: isLoadingTopics,
    execute: executeTopics,
    retry: retryTopics,
    reset: resetTopics
  } = useErrorHandling({
    maxRetries: 3,
    retryDelay: 2000,
    onError: (error) => logError(error, 'TopicLoader')
  })

  const {
    error: subtopicsError,
    isLoading: isLoadingSubtopics,
    execute: executeSubtopics,
    retry: retrySubtopics
  } = useErrorHandling({
    maxRetries: 2,
    retryDelay: 1500,
    onError: (error) => logError(error, 'SubtopicLoader')
  })

  const {
    error: availabilityError,
    isLoading: isLoadingAvailability,
    execute: executeAvailability,
    retry: retryAvailability
  } = useErrorHandling({
    maxRetries: 2,
    retryDelay: 3000,
    onError: (error) => logError(error, 'AvailabilityLoader')
  })

  const [topics, setTopics] = useState<QuizTopic[]>([])
  const [subtopics, setSubtopics] = useState<QuizSubtopic[]>([])
  const [availability, setAvailability] = useState<Record<string, { questionCount: number; hasQuestions: boolean }>>({})

  // Load initial data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    // Load topics
    const topicsResult = await executeTopics(async () => {
      const data = await apiClient.getTopics()
      setTopics(data)
      return data
    })

    // Load availability data
    executeAvailability(async () => {
      const data = await apiClient.getSubtopicAvailability()
      setAvailability(data)
      return data
    })
  }

  const loadSubtopicsForTopic = async (topicSlug: string) => {
    const result = await executeSubtopics(async () => {
      const data = await apiClient.getSubtopics({ topic: topicSlug })
      setSubtopics(data)
      return data
    })
    return result
  }

  const retryAll = async () => {
    resetTopics()
    loadAllData()
  }

  const isLoading = isLoadingTopics || isLoadingSubtopics || isLoadingAvailability
  const hasError = topicsError || subtopicsError || availabilityError
  const primaryError = topicsError || subtopicsError || availabilityError

  return (
    <ErrorBoundary>
      {children({
        topics,
        subtopics,
        availability,
        isLoading,
        error: primaryError,
        retry: () => retryAll()
      })}
    </ErrorBoundary>
  )
}

// Specialized data loaders
export function TopicsDataLoader({ 
  children 
}: { 
  children: (data: { topics: QuizTopic[], isLoading: boolean, error: any, retry: () => void }) => React.ReactNode 
}) {
  const { error, isLoading, execute, retry } = useErrorHandling({
    onError: (error) => logError(error, 'TopicsDataLoader')
  })
  
  const [topics, setTopics] = useState<QuizTopic[]>([])

  const loadTopics = async () => {
    const data = await apiClient.getTopics()
    setTopics(data)
    return data
  }

  useEffect(() => {
    execute(loadTopics)
  }, [execute])

  const handleRetry = async () => {
    await retry(loadTopics)
  }

  return (
    <ErrorBoundary>
      <AsyncWrapper
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        showSkeleton={true}
        skeletonComponent={<GridSkeleton items={6} columns={2} />}
      >
        {children({ topics, isLoading, error, retry: handleRetry })}
      </AsyncWrapper>
    </ErrorBoundary>
  )
}

export function SubtopicsDataLoader({ 
  topicSlug,
  children 
}: { 
  topicSlug: string
  children: (data: { subtopics: QuizSubtopic[], isLoading: boolean, error: any, retry: () => void }) => React.ReactNode 
}) {
  const { error, isLoading, execute, retry } = useErrorHandling({
    onError: (error) => logError(error, 'SubtopicsDataLoader')
  })
  
  const [subtopics, setSubtopics] = useState<QuizSubtopic[]>([])

  const loadSubtopics = async () => {
    const data = await apiClient.getSubtopics({ topic: topicSlug })
    setSubtopics(data)
    return data
  }

  useEffect(() => {
    if (topicSlug) {
      execute(loadSubtopics)
    }
  }, [topicSlug, execute])

  const handleRetry = async () => {
    await retry(loadSubtopics)
  }

  return (
    <ErrorBoundary>
      <AsyncWrapper
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        showSkeleton={true}
        skeletonComponent={<SubtopicListSkeleton />}
      >
        {children({ subtopics, isLoading, error, retry: handleRetry })}
      </AsyncWrapper>
    </ErrorBoundary>
  )
}