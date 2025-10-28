'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useSubtopicStore } from '@/stores/useSubtopicStore'
import { strapiClient } from '@/lib/strapi'
import { DataLoadingScreen } from '@/components/ui/LoadingScreen'
import { FadeTransition } from '@/components/animations/PageTransition'
import { trackEvent, trackPageView } from '@/lib/analytics'
import TopicIcon from '@/components/ui/TopicIcon'
import type { QuizTopic } from '@gyan-pravah/types'



export default function TopicsPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<QuizTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)


  const {
    availability: subtopicAvailability,
    setAvailability,
    setLoading: setAvailabilityLoading,
    isStale
  } = useSubtopicStore()

  useEffect(() => {
    trackPageView('topics')
    loadTopics()
    
    // Load subtopic availability if cache is stale
    if (isStale()) {
      loadSubtopicAvailability()
    }
  }, [])

  const loadSubtopicAvailability = async () => {
    try {
      setAvailabilityLoading(true)
      const availability = await strapiClient.getSubtopicAvailability()
      setAvailability(availability)
    } catch (error) {
      console.error('Failed to load subtopic availability:', error)
      setAvailabilityLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      setIsLoading(true)
      const topicsData = await strapiClient.getTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load topics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicSelect = (topic: QuizTopic) => {
    trackEvent('topic_selected', {
      topic: topic.slug,
      topic_id: topic.id,
      subtopics_available: topic.quiz_subtopics?.length || 0
    })
    
    // Navigate directly to subtopics page for this topic
    router.push(`/topics/subtopics?topic=${topic.slug}`)
  }

  const handleBack = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8B7FC8' }}>
        <DataLoadingScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
      <FadeTransition pageKey="topics-page">
        <div className="px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={handleBack}
              className="p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            
            <motion.button
              className="p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">
              Gyan Pravah
            </h1>
            <p className="text-white opacity-90">
              Choose a topic to start your quiz
            </p>
          </motion.div>

          {/* Topics Grid */}
          <div className="max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {topics.map((topic, index) => {
                const totalSubtopics = topic.quiz_subtopics?.length || 0
                const availableSubtopics = topic.quiz_subtopics?.filter(subtopic => 
                  subtopicAvailability[subtopic.slug]?.hasQuestions
                ).length || 0
                
                return (
                  <motion.button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Topic Icon */}
                      <div className="mb-3">
                        {topic.topicIcon ? (
                          <div className="text-5xl">
                            {topic.topicIcon}
                          </div>
                        ) : (
                          <TopicIcon topicSlug={topic.slug} size="lg" className="w-12 h-12 text-gray-600" />
                        )}
                      </div>
                      
                      {/* Topic Name */}
                      <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">
                        {topic.topicName}
                      </h3>
                      
                      {/* Subtopic Count */}
                      <p className="text-sm text-gray-600">
                        {availableSubtopics > 0 ? (
                          `${availableSubtopics} subtopics`
                        ) : (
                          <span className="text-orange-600 font-medium">Coming Soon</span>
                        )}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          </div>
        </div>
      </FadeTransition>
    </div>
  )
}