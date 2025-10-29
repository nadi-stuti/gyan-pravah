'use client'

import { useState, useEffect } from 'react'
import { QuizTopic } from '@gyan-pravah/types'
import { getTopicsWithAvailability } from '@/lib/api-client'

interface TopicWithAvailability extends QuizTopic {
  hasAvailableSubtopics: boolean
  availableSubtopicCount: number
}

/**
 * Example component showing how to display topics with availability status
 * Uses the optimized getTopicsWithAvailability method
 */
export function TopicSelectorWithAvailability() {
  const [topics, setTopics] = useState<TopicWithAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Single optimized API call that includes availability status
        const topicsData = await getTopicsWithAvailability()
        setTopics(topicsData)
        
        console.log('Topics loaded:', topicsData.map(t => ({
          name: t.topicName,
          available: t.hasAvailableSubtopics,
          count: t.availableSubtopicCount
        })))
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load topics')
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading topics...</div>
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

  const availableTopics = topics.filter(t => t.hasAvailableSubtopics)
  const comingSoonTopics = topics.filter(t => !t.hasAvailableSubtopics)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Select a Topic</h2>
      
      {/* Available Topics */}
      {availableTopics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Topics</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#8B7FC8] hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#8B7FC8] rounded-lg flex items-center justify-center text-white text-xl">
                    {topic.topicIcon || '📚'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#8B7FC8] transition-colors">
                      {topic.topicName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {topic.availableSubtopicCount} subtopic{topic.availableSubtopicCount !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon Topics */}
      {comingSoonTopics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Coming Soon</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 opacity-60"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-xl">
                    {topic.topicIcon || '📚'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-600">
                      {topic.topicName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Coming Soon
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <strong>{availableTopics.length}</strong> topics available, 
          <strong> {comingSoonTopics.length}</strong> coming soon
        </div>
      </div>
    </div>
  )
}

// Example usage:
/*
// This component will show all 9 topics, with proper "Available" vs "Coming Soon" status
// based on whether they have available subtopics
<TopicSelectorWithAvailability />
*/