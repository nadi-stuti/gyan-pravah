'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '../ui/Button'
import { useQuizStore } from '@/stores/useQuizStore'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { strapiClient } from '@/lib/strapi'
import { trackEvent } from '@/lib/analytics'

export default function PlayNowButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setQuestions, setExpertMode, setGameStatus, resetQuiz } = useQuizStore()
  const { expertModeEnabled, incrementGamesPlayed } = useUserPreferences()

  const handlePlayNow = async () => {
    setIsLoading(true)
    
    try {
      // Track play now button click
      trackEvent('play_now_clicked', {
        is_expert_mode: expertModeEnabled,
        is_first_visit: false // PlayNowButton is only shown to returning users
      })
      
      // Reset any existing quiz state
      resetQuiz()
      
      // Set expert mode based on user preference
      setExpertMode(expertModeEnabled)
      
      // Fetch random questions based on mode (QuizUp style: 7 questions)
      const mode = expertModeEnabled ? 'expert' : 'normal'
      const questions = await strapiClient.getRandomQuestions(7, mode)
      
      if (questions.length === 0) {
        throw new Error('No questions available')
        
      }
      
      // Track quiz start
      trackEvent('quiz_started', {
        mode: 'random',
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
      
      // Navigate to quiz page
      router.push('/quiz')
      
    } catch (error) {
      console.error('Failed to start quiz:', error)
      
      // Track error
      trackEvent('quiz_error', {
        error_type: 'api_failure',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        context: 'play_now_button'
      })
      
      // TODO: Show error toast/notification
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: 0.1
      }}
      className="w-full"
    >
      <button
        onClick={handlePlayNow}
        disabled={isLoading}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg sm:text-xl min-h-touch-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation"
        role="button"
        aria-disabled={isLoading}
      >
        {isLoading ? '⏳ Starting Quiz...' : '🚀 Play Now'}
      </button>
      
      <motion.p 
        className="text-center text-white opacity-90 text-xs sm:text-sm mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Random questions • {expertModeEnabled ? 'Expert Mode' : 'Normal Mode'}
      </motion.p>
    </motion.div>
  )
}