'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import QuizGameLogic from './QuizGameLogic'
import { trackEvent } from '@/lib/analytics'
import type { QuizQuestion } from '@gyan-pravah/types'

interface QuizGameProps {
  questions: QuizQuestion[]
  topicSlug: string
  subtopicSlug: string
  isExpertMode: boolean
  isRandomQuiz?: boolean
}

export default function QuizGame({
  questions,
  topicSlug,
  subtopicSlug,
  isExpertMode,
  isRandomQuiz = false
}: QuizGameProps) {
  const router = useRouter()
  const { 
    setQuestions, 
    setExpertMode, 
    setGameStatus, 
    resetQuiz, 
    setQuizMetadata 
  } = useQuizStore()

  // Initialize quiz state on mount
  useEffect(() => {
    // resetQuiz()
    setQuestions(questions)
    setExpertMode(isExpertMode)
    
    if (isRandomQuiz) {
      setQuizMetadata('random')
    } else {
      setQuizMetadata('topic', topicSlug, subtopicSlug)
    }
    
    setGameStatus('playing')
    
    trackEvent('quiz_started', {
      mode: isRandomQuiz ? 'random' : (isExpertMode ? 'expert' : 'normal'),
      topic: isRandomQuiz ? undefined : topicSlug,
      subtopic: isRandomQuiz ? undefined : subtopicSlug,
      total_questions: questions.length,
      is_expert_mode: isExpertMode,
      is_first_visit: false,
      quiz_mode: 'quizup'
    })
  }, [
    questions, 
    topicSlug, 
    subtopicSlug, 
    isExpertMode,
    isRandomQuiz,
    setQuestions, 
    setExpertMode, 
    setQuizMetadata, 
    setGameStatus, 
    resetQuiz
  ])

  const handleQuizComplete = () => {
    setGameStatus('completed')
    router.push('/results')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
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
