'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import QuizGameLogic from '@/components/quiz/QuizGameLogic'
import QuizExitHandler from '@/components/navigation/QuizExitHandler'
import { QuizLoadingScreen } from '@/components/ui/LoadingScreen'

export default function QuizPage() {
  const router = useRouter()
  const { questions, gameStatus, setGameStatus } = useQuizStore()

  // Redirect to home if no quiz is active (page view tracking handled by ClientLayout)
  useEffect(() => {
    // Only redirect if there's no quiz data, not if it's completed
    if (questions.length === 0 || (gameStatus !== 'playing' && gameStatus !== 'completed')) {
      router.push('/')
    }
  }, [gameStatus, questions.length, router])

  const handleQuizComplete = (finalScore: number, answers: Record<number, string>) => {
    // Set game status to completed
    setGameStatus('completed')
    
    // Navigate to results page (score is already stored in Zustand)
    router.push('/results')
  }

  // Show loading if redirecting
  if (questions.length === 0 || (gameStatus !== 'playing' && gameStatus !== 'completed')) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <QuizLoadingScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
      <QuizExitHandler />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <QuizGameLogic
          questions={questions}
          onQuizComplete={handleQuizComplete}
          quizMode="quizup"
          className="w-full"
        />
      </div>
    </div>
  )
}