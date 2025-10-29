'use client'

import { useState, useEffect } from 'react'
import { QuizSubtopic } from '@gyan-pravah/types'
import { getAvailableSubtopics, getAvailableSubtopicsForTopic } from '@/lib/quiz-api'

interface OptimizedSubtopicListProps {
  topicSlug?: string
  showQuestionCounts?: boolean
}

/**
 * Example component demonstrating the optimized subtopic fetching
 * Uses the new available field and questionCount for efficient data loading
 */
export function OptimizedSubtopicList({ 
  topicSlug, 
  showQuestionCounts = false 
}: OptimizedSubtopicListProps) {
  const [subtopics, setSubtopics] = useState<QuizSubtopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubtopics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Single optimized API call - no nested requests or availability checks
        const data = topicSlug 
          ? await getAvailableSubtopicsForTopic(topicSlug)
          : await getAvailableSubtopics()
        
        setSubtopics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subtopics')
      } finally {
        setLoading(false)
      }
    }

    fetchSubtopics()
  }, [topicSlug])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading available subtopics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    )
  }

  if (subtopics.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600">
        No available subtopics found
        {topicSlug && ` for topic: ${topicSlug}`}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">
        Available Subtopics {topicSlug && `for ${topicSlug}`}
      </h3>
      
      <div className="grid gap-3">
        {subtopics.map((subtopic) => (
          <div
            key={subtopic.id}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-[#8B7FC8] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{subtopic.name}</h4>
                <p className="text-sm text-gray-600">Slug: {subtopic.slug}</p>
                {subtopic.quiz_topic && (
                  <p className="text-xs text-gray-500">
                    Topic: {subtopic.quiz_topic.topicName}
                  </p>
                )}
              </div>
              
              {showQuestionCounts && (
                <div className="text-right">
                  <div className="text-sm font-medium text-[#8B7FC8]">
                    {subtopic.questionCount || 0} questions
                  </div>
                  <div className="text-xs text-gray-500">
                    {subtopic.available ? 'Available' : 'Not available'}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500 text-center">
        Showing {subtopics.length} available subtopic{subtopics.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

// Example usage in a page or component:
/*
// Get all available subtopics
<OptimizedSubtopicList showQuestionCounts={true} />

// Get available subtopics for a specific topic
<OptimizedSubtopicList topicSlug="dham" showQuestionCounts={true} />
*/