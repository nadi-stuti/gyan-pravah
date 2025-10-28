'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { trackEvent } from '@/lib/analytics'

export default function NavigationHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const { gameStatus, questions, resetQuiz } = useQuizStore()

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Track browser navigation
      trackEvent('browser_navigation', {
        from_path: pathname,
        navigation_type: 'back_forward',
        has_quiz_data: questions.length > 0,
        game_status: gameStatus
      })

      // Handle quiz state when navigating back
      if (pathname === '/quiz' && gameStatus === 'playing') {
        // User is navigating away from active quiz
        const shouldLeave = window.confirm(
          'You have a quiz in progress. Are you sure you want to leave? Your progress will be lost.'
        )
        
        if (!shouldLeave) {
          // Prevent navigation and stay on quiz page
          event.preventDefault()
          window.history.pushState(null, '', '/quiz')
          return
        } else {
          // Reset quiz if user confirms leaving
          resetQuiz()
          trackEvent('quiz_abandoned', {
            reason: 'browser_navigation',
            questions_answered: Object.keys(useQuizStore.getState().selectedAnswers).length,
            total_questions: questions.length
          })
        }
      }

      // Handle results page navigation
      if (pathname === '/results' && questions.length === 0) {
        // No quiz data available, redirect to home
        router.replace('/')
      }
    }

    // Add event listener for browser back/forward
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, gameStatus, questions, resetQuiz, router])

  // Handle route changes programmatically
  useEffect(() => {
    // Validate route access based on quiz state
    if (pathname === '/quiz' && questions.length === 0 && gameStatus !== 'playing') {
      // No quiz data, redirect to home
      router.replace('/')
    }

    if (pathname === '/results' && questions.length === 0) {
      // No quiz data for results, redirect to home
      router.replace('/')
    }
  }, [pathname, questions.length, gameStatus, router])

  return null // This component doesn't render anything
}