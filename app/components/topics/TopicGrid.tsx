'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { trackEvent } from '@/lib/analytics'
import TopicIcon from '@/components/ui/TopicIcon'
import type { QuizTopic } from '@gyan-pravah/types'

interface TopicGridProps {
  topics: Array<QuizTopic & { 
    hasAvailableSubtopics: boolean
    availableSubtopicCount: number 
  }>
}

export default function TopicGrid({ topics }: TopicGridProps) {
  const router = useRouter()

  const handleTopicSelect = (topic: QuizTopic & { availableSubtopicCount: number }) => {
    trackEvent('topic_selected', {
      topic: topic.slug,
      topic_id: topic.id,
      subtopics_available: topic.availableSubtopicCount
    })
    
    // Navigate directly to subtopics page for this topic
    router.push(`/topics/subtopics?topic=${topic.slug}`)
  }

  return (
    <div className="max-w-md mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        {topics.map((topic, index) => {
          const availableSubtopics = topic.availableSubtopicCount
          
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
  )
}
