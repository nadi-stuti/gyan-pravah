'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { useQuizStore } from '@/stores/useQuizStore'
import { useSubtopicStore } from '@/stores/useSubtopicStore'
import { strapiClient } from '@/lib/strapi'
import PlayNowButton from '@/components/home/PlayNowButton'
import ExpertModeToggle from '@/components/home/ExpertModeToggle'
import FactsCard from '@/components/home/FactsCard'
import { DataLoadingScreen } from '@/components/ui/LoadingScreen'
import { FadeTransition } from '@/components/animations/PageTransition'
import { trackEvent, trackPageView } from '@/lib/analytics'

export default function Home() {
  const router = useRouter()
  const [isFirstVisitHandled, setIsFirstVisitHandled] = useState(false)

  const {
    isFirstVisit,
    setFirstVisit,
    incrementGamesPlayed
  } = useUserPreferences()

  const {
    setQuestions,
    setExpertMode,
    setGameStatus,
    resetQuiz
  } = useQuizStore()

  const {
    setAvailability,
    setLoading: setAvailabilityLoading,
    isStale
  } = useSubtopicStore()

  // Track page view and handle first visit
  useEffect(() => {
    trackPageView('home')

    // Load subtopic availability if cache is stale
    const loadAvailabilityIfNeeded = async () => {
      if (isStale()) {
        try {
          setAvailabilityLoading(true)
          const availability = await strapiClient.getSubtopicAvailability()
          setAvailability(availability)
        } catch (error) {
          console.error('Failed to load subtopic availability:', error)
          setAvailabilityLoading(false)
        }
      }
    }

    loadAvailabilityIfNeeded()

    const handleFirstVisit = async () => {
      if (isFirstVisit && !isFirstVisitHandled) {
        setIsFirstVisitHandled(true)

        try {
          // Track first visit quiz start
          trackEvent('quiz_started', {
            mode: 'first-visit',
            total_questions: 3,
            is_expert_mode: false,
            is_first_visit: true,
            quiz_mode: 'first-visit'
          })

          // Reset any existing quiz state
          resetQuiz()

          // Set to normal mode (not expert) for first visit
          setExpertMode(false)

          // Fetch very easy questions from mixed topics (3 questions for first visit)
          const questions = await strapiClient.getRandomQuestions(3, 'first-visit')

          if (questions.length > 0) {
            // Set up the quiz
            setQuestions(questions)
            setGameStatus('playing')

            // Mark as no longer first visit
            setFirstVisit(false)

            // Track game start
            incrementGamesPlayed()

            // Navigate to quiz page
            router.push('/quiz')
          }
        } catch (error) {
          console.error('Failed to start first-visit quiz:', error)

          // Track error
          trackEvent('quiz_error', {
            error_type: 'api_failure',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            context: 'first_visit_quiz'
          })

          // If first visit fails, just continue to normal home page
          setIsFirstVisitHandled(true)
        }
      }
    }

    handleFirstVisit()
  }, [isFirstVisit, isFirstVisitHandled, router, resetQuiz, setExpertMode, setQuestions, setGameStatus, setFirstVisit, incrementGamesPlayed])

  // Show loading screen during first visit handling
  if (isFirstVisit && !isFirstVisitHandled) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <DataLoadingScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
      <main className="flex min-h-screen flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <FadeTransition pageKey="home-page">
          <div className="w-full max-w-sm sm:max-w-md mx-auto">
            {/* App Title */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Gyan Pravah
              </h1>
              <p className="text-white opacity-90 text-sm sm:text-base px-2">
                Test your knowledge with engaging animated quizzes
              </p>
            </motion.div>

            <div className="space-y-4 sm:space-y-6">
              {/* Play Now Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PlayNowButton />
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center"
              >
                <div className="flex-1 h-px bg-white opacity-30"></div>
                <span className="px-4 text-sm text-white opacity-90">or</span>
                <div className="flex-1 h-px bg-white opacity-30"></div>
              </motion.div>

              {/* Choose Topics Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => router.push('/topics')}
                  className="w-full bg-white rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-105 min-h-touch-lg touch-manipulation"
                  role="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        Choose Topics & Start Quiz
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Select your favorite topics and customize your experience
                      </p>
                    </div>
                    <div className="text-gray-600 shrink-0 ml-2">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </motion.div>

              {/* Expert Mode Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <ExpertModeToggle />
              </motion.div>

              {/* Facts Card */}
              <FactsCard />
            </div>
          </div>
        </FadeTransition>
      </main>
    </div>
  )
}
