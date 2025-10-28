'use client'

import { useState } from 'react'
import { QuizQuestion } from '@gyan-pravah/types'
import { QuizGameLogic } from '../../components/quiz'

// Mock quiz questions for testing
const mockQuestions: QuizQuestion[] = [
  {
    id: 1,
    documentId: 'test-1',
    question: 'What is the capital of France?',
    options: {
      A: 'London',
      B: 'Berlin',
      C: 'Paris',
      D: 'Madrid'
    },
    correctOption: 'C',
    difficulty: 'Easy',
    explanation: 'Paris is the capital and largest city of France.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    publishedAt: '2024-01-01'
  },
  {
    id: 2,
    documentId: 'test-2',
    question: 'Which planet is known as the Red Planet?',
    options: {
      A: 'Venus',
      B: 'Mars',
      C: 'Jupiter',
      D: 'Saturn'
    },
    correctOption: 'B',
    difficulty: 'Medium',
    explanation: 'Mars is called the Red Planet due to its reddish appearance.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    publishedAt: '2024-01-01'
  },
  {
    id: 3,
    documentId: 'test-3',
    question: 'What is the largest mammal in the world?',
    options: {
      A: 'Elephant',
      B: 'Blue Whale',
      C: 'Giraffe',
      D: 'Hippopotamus'
    },
    correctOption: 'B',
    difficulty: 'Hard',
    explanation: 'The blue whale is the largest animal ever known to have lived on Earth.',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    publishedAt: '2024-01-01'
  }
]

export default function QuizTestPage() {
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const handleQuizComplete = (score: number, userAnswers: Record<number, string>) => {
    setFinalScore(score)
    setAnswers(userAnswers)
    setQuizCompleted(true)
  }

  const resetQuiz = () => {
    setQuizCompleted(false)
    setFinalScore(0)
    setAnswers({})
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-2xl p-8 shadow-card text-center">
            <h1 className="text-3xl font-poppins font-bold text-primary-600 mb-4">
              Quiz Complete!
            </h1>
            <div className="text-6xl font-bold text-success-500 mb-4">
              {finalScore}
            </div>
            <p className="text-text-secondary mb-6">
              You answered {Object.keys(answers).length} out of {mockQuestions.length} questions
            </p>
            <button
              onClick={resetQuiz}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-poppins font-medium hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-poppins font-bold text-primary-600 mb-2">
            Quiz Game Test
          </h1>
          <p className="text-text-secondary">
            Testing the quiz game components with sample questions
          </p>
        </div>
        
        <QuizGameLogic
          questions={mockQuestions}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    </div>
  )
}