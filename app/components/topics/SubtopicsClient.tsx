'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { trackEvent } from '@/lib/analytics'
import TopicIcon from '@/components/ui/TopicIcon'
import BackButton from '@/components/navigation/BackButton'
import type { QuizTopic } from '@gyan-pravah/types'

// Topic colors based on design system
const topicColors: Record<string, string> = {
  'nadi': '#3B82F6', // blue-500
  'shastras': '#F59E0B', // amber-500
  'granth': '#8B5CF6', // violet-500
  'bhagvan': '#EF4444', // red-500
  'utsav': '#10B981', // emerald-500
  'dham': '#F97316', // orange-500
  'sant': '#6366F1', // indigo-500
  'mythology': '#8B5CF6', // violet-500
  'festivals': '#10B981', // emerald-500
  'scriptures': '#F59E0B', // amber-500
  'philosophy': '#6366F1', // indigo-500
  'history': '#F97316', // orange-500
  'rituals': '#EF4444' // red-500
}

interface SubtopicsClientProps {
  topic: QuizTopic
  subtopicAvailability: Record<string, { questionCount: number; hasQuestions: boolean }>
}

export default function SubtopicsClient({ topic, subtopicAvailability }: SubtopicsClientProps) {
  const router = useRouter()
  const { expertModeEnabled } = useUserPreferences()

  const handleSubtopicSelect = (topicSlug: string, subtopicSlug: string) => {
    // Check if subtopic has questions
    const availability = subtopicAvailability[subtopicSlug]
    if (!availability?.hasQuestions) {
      return // Don't allow selection of subtopics without questions
    }

    trackEvent('subtopic_selected', {
      topic: topicSlug,
      subtopic: subtopicSlug,
      subtopic_id: 0
    })

    // Navigate to quiz page with topic and subtopic
    const mode = expertModeEnabled ? 'expert' : 'normal'
    router.push(`/quiz/${topicSlug}/${subtopicSlug}?mode=${mode}`)
  }

  // Sort subtopics: available first, then coming soon
  const sortedSubtopics = topic.quiz_subtopics?.sort((a, b) => {
    const aHasQuestions = subtopicAvailability[a.slug]?.hasQuestions || false
    const bHasQuestions = subtopicAvailability[b.slug]?.hasQuestions || false
    
    if (aHasQuestions && !bHasQuestions) return -1
    if (!aHasQuestions && bHasQuestions) return 1
    return 0
  }) || []

  const availableSubtopics = sortedSubtopics.filter(subtopic => 
    subtopicAvailability[subtopic.slug]?.hasQuestions
  )
  const comingSoonSubtopics = sortedSubtopics.filter(subtopic => 
    !subtopicAvailability[subtopic.slug]?.hasQuestions
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
      <div className="px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <BackButton to="/topics" />
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Current Topic */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Topic Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: topicColors[topic.slug] || '#8B5CF6' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <TopicIcon topicSlug={topic.slug} size="lg" className="text-white w-10 h-10" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {topic.topicName}
            </h1>
            <p className="text-white opacity-90">
              Choose a subtopic to continue
            </p>
          </div>

          {/* Subtopics List */}
          <div className="space-y-3 mb-8">
            {/* Available Subtopics */}
            {availableSubtopics.map((subtopic, index) => {
              const availability = subtopicAvailability[subtopic.slug]
              const questionCount = availability?.questionCount || 0

              return (
                <motion.button
                  key={subtopic.id}
                  onClick={() => handleSubtopicSelect(topic.slug, subtopic.slug)}
                  className="w-full p-4 rounded-2xl text-left transition-all duration-200 bg-white text-gray-800 hover:bg-gray-50 hover:shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1 text-gray-800">
                        {subtopic.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {questionCount} questions available
                      </p>
                    </div>
                    
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              )
            })}

            {/* Separator if both types exist */}
            {availableSubtopics.length > 0 && comingSoonSubtopics.length > 0 && (
              <div className="py-2">
                <div className="flex items-center">
                  <div className="flex-1 h-px bg-white bg-opacity-30"></div>
                  <span className="px-3 text-xs text-white opacity-60 font-medium">Coming Soon</span>
                  <div className="flex-1 h-px bg-white bg-opacity-30"></div>
                </div>
              </div>
            )}

            {/* Coming Soon Subtopics */}
            {comingSoonSubtopics.map((subtopic, index) => (
              <motion.div
                key={subtopic.id}
                className="w-full p-4 rounded-2xl text-left bg-white bg-opacity-40 cursor-not-allowed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (availableSubtopics.length + index) * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1 text-gray-400">
                      {subtopic.name}
                    </h3>
                    <p className="text-sm text-orange-500 font-medium opacity-70">
                      🚧 Coming Soon
                    </p>
                  </div>
                  
                  <div className="text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0V9a4 4 0 018 0v2m-8 0h8" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
