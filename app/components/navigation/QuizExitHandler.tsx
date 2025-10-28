'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { trackEvent } from '@/lib/analytics'

export default function QuizExitHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const { gameStatus, questions, selectedAnswers, resetQuiz } = useQuizStore()

  useEffect(() => {
    // Only handle exit confirmation on quiz page
    if (pathname !== '/quiz' || gameStatus !== 'playing') {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Show confirmation when user tries to close/refresh browser
      event.preventDefault()
      event.returnValue = 'You have a quiz in progress. Are you sure you want to leave?'
      return event.returnValue
    }

    const handleVisibilityChange = () => {
      // Track when user switches tabs during quiz
      if (document.hidden) {
        trackEvent('quiz_tab_switched', {
          questions_answered: Object.keys(selectedAnswers).length,
          total_questions: questions.length,
          game_status: gameStatus
        })
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname, gameStatus, questions.length, selectedAnswers])

  return null
}