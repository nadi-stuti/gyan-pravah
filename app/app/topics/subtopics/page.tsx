'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { useQuizStore } from '@/stores/useQuizStore'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { useSubtopicStore } from '@/stores/useSubtopicStore'
import { strapiClient } from '@/lib/strapi'
import { DataLoadingScreen } from '@/components/ui/LoadingScreen'
import { FadeTransition } from '@/components/animations/PageTransition'
import { trackEvent, trackPageView } from '@/lib/analytics'
import TopicIcon from '@/components/ui/TopicIcon'
import type { QuizTopic, QuizSubtopic } from '@gyan-pravah/types'

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

function SubtopicsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [topics, setTopics] = useState<QuizTopic[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isStartingQuiz, setIsStartingQuiz] = useState(false)

  const { setQuestions, setExpertMode, setGameStatus, resetQuiz } = useQuizStore()
  const { 
    expertModeEnabled, 
    setLastPlayedTopic, 
    setLastPlayedSubtopic, 
    incrementGamesPlayed 
  } = useUserPreferences()
  const { availability: subtopicAvailability } = useSubtopicStore()

  useEffect(() => {
    trackPageView('subtopics')
    loadSelectedTopic()
  }, [])

  const loadSelectedTopic = async () => {
    try {
      setIsLoading(true)
      const topicParam = searchParams.get('topic')
      
      if (!topicParam) {
        router.push('/topics')
        return
      }

      const allTopics = await strapiClient.getTopics()
      const selectedTopic = allTopics.find(topic => topic.slug === topicParam)
      
      if (!selectedTopic) {
        router.push('/topics')
        return
      }

      // Load subtopics for the selected topic
      const subtopics = await strapiClient.getSubtopics({ topic: selectedTopic.slug })
      const topicWithSubtopics = { ...selectedTopic, quiz_subtopics: subtopics }

      setTopics([topicWithSubtopics])
    } catch (error) {
      console.error('Failed to load topic:', error)
      router.push('/topics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubtopicSelect = async (topicSlug: string, subtopicSlug: string) => {
    // Check if subtopic has questions
    const availability = subtopicAvailability[subtopicSlug]
    if (!availability?.hasQuestions) {
      return // Don't allow selection of subtopics without questions
    }

    trackEvent('subtopic_selected', {
      topic: topicSlug,
      subtopic: subtopicSlug,
      subtopic_id: 0 // We don't have the ID here, but it's required by the type
    })

    // Start quiz immediately
    await startQuiz(topicSlug, subtopicSlug)
  }

  const handleBack = () => {
    router.push('/topics')
  }

  const startQuiz = async (topicSlug: string, subtopicSlug: string) => {
    setIsStartingQuiz(true)

    try {
      // Reset any existing quiz state
      resetQuiz()
      
      // Set expert mode based on user preference
      setExpertMode(expertModeEnabled)

      // Get questions for the selected subtopic
      const questions = await strapiClient.getQuestions({
        subtopic: subtopicSlug,
        difficulty: expertModeEnabled ? 'Medium' : 'Easy',
        limit: 7 // QuizUp style: 7 questions
      })

      if (questions.length === 0) {
        throw new Error('No questions available for this subtopic')
      }

      // Track quiz start
      trackEvent('quiz_started', {
        mode: expertModeEnabled ? 'expert' : 'normal',
        topic: topicSlug,
        subtopic: subtopicSlug,
        total_questions: questions.length,
        is_expert_mode: expertModeEnabled,
        is_first_visit: false,
        quiz_mode: 'quizup'
      })

      // Set up the quiz
      setQuestions(questions)
      setGameStatus('playing')

      // Track game start in user preferences
      incrementGamesPlayed()

      // Set last played
      setLastPlayedTopic(topicSlug)
      setLastPlayedSubtopic(subtopicSlug)

      // Navigate to quiz page
      router.push('/quiz')

    } catch (error) {
      console.error('Failed to start quiz:', error)
      
      trackEvent('quiz_error', {
        error_type: 'api_failure',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        context: 'topic_selection_quiz'
      })
      
      setIsStartingQuiz(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8B7FC8' }}>
        <DataLoadingScreen />
      </div>
    )
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8B7FC8' }}>
        <div className="text-center text-white">
          <p className="mb-4">No topics found</p>
          <button
            onClick={() => router.push('/topics')}
            className="bg-white text-[#8B7FC8] px-6 py-2 rounded-xl font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const currentTopic = topics[0] // We only have one topic now

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
      <FadeTransition pageKey="subtopics-page">
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
            
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Current Topic */}
          <motion.div
            key={currentTopic?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-md mx-auto"
          >
            {/* Topic Header */}
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: topicColors[currentTopic?.slug] || '#8B5CF6' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <TopicIcon topicSlug={currentTopic?.slug || ''} size="lg" className="text-white w-10 h-10" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                {currentTopic?.topicName}
              </h1>
              <p className="text-white opacity-90">
                Choose a subtopic to continue
              </p>
            </div>

            {/* Subtopics List */}
            <div className="space-y-3 mb-8">
              {(() => {
                const sortedSubtopics = currentTopic?.quiz_subtopics?.sort((a, b) => {
                  // Sort available subtopics first
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
                  <>
                    {/* Available Subtopics */}
                    {availableSubtopics.map((subtopic, index) => {
                      const availability = subtopicAvailability[subtopic.slug]
                      const questionCount = availability?.questionCount || 0

                      return (
                        <motion.button
                          key={subtopic.id}
                          onClick={() => handleSubtopicSelect(currentTopic.slug, subtopic.slug)}
                          disabled={isStartingQuiz}
                          className={`
                            w-full p-4 rounded-2xl text-left transition-all duration-200
                            bg-white text-gray-800 hover:bg-gray-50 hover:shadow-md
                            ${isStartingQuiz ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={!isStartingQuiz ? { scale: 1.02 } : {}}
                          whileTap={!isStartingQuiz ? { scale: 0.98 } : {}}
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
                  </>
                )
              })()}
            </div>

            {/* Loading indicator when starting quiz */}
            {isStartingQuiz && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <div className="flex items-center justify-center text-white">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Starting your quiz...
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </FadeTransition>
    </div>
  )
}

export default function SubtopicsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8B7FC8' }}>
        <DataLoadingScreen />
      </div>
    }>
      <SubtopicsContent />
    </Suspense>
  )
}