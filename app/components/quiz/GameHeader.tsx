'use client'

import { motion } from 'motion/react'
import { useQuizStore } from '@/stores/useQuizStore'

interface GameHeaderProps {
  currentQuestion: number
  totalQuestions: number
  score: number
  className?: string
}

export default function GameHeader({
  currentQuestion,
  totalQuestions,
  score,
  className = ''
}: GameHeaderProps) {
  const { questions, selectedAnswers, averageReactionTime } = useQuizStore()

  // Generate round indicators based on current progress and user answers
  const getRoundIndicators = () => {
    const indicators = []
    for (let i = 0; i < totalQuestions; i++) {
      let status: 'pending' | 'current' | 'completed' | 'correct' | 'incorrect' | 'skipped' = 'pending'
      const isBonus = i >= 6 // Questions 7+ are bonus rounds (QuizUp style)
      
      if (i < currentQuestion) {
        // Question has been answered, check if it was correct
        const userAnswer = selectedAnswers[i]
        const question = questions[i]
        
        if (!userAnswer) {
          status = 'skipped'
        } else if (userAnswer === question?.correctOption) {
          status = 'correct'
        } else {
          status = 'incorrect'
        }
      } else if (i === currentQuestion) {
        status = 'current'
      }
      
      // Determine colors based on status
      let colorClasses = ''
      if (status === 'correct') {
        colorClasses = isBonus 
          ? 'bg-orange-500 text-white border-orange-600' 
          : 'bg-green-500 text-white border-green-600'
      } else if (status === 'incorrect') {
        colorClasses = 'bg-red-500 text-white border-red-600'
      } else if (status === 'skipped') {
        colorClasses = 'bg-gray-400 text-white border-gray-500'
      } else if (status === 'current') {
        colorClasses = 'bg-yellow-400 text-gray-900 border-yellow-500'
      } else {
        colorClasses = isBonus 
          ? 'bg-orange-100 text-orange-600 border-orange-300'
          : 'bg-gray-300 text-gray-600 border-gray-400'
      }
      
      indicators.push(
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${colorClasses}`}
        >
          {isBonus ? '★' : i + 1}
        </motion.div>
      )
    }
    return indicators
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-4 mb-6 shadow-lg ${className}`}
    >
      {/* Top Row - Round Indicators */}
      <div className="flex justify-center items-center gap-2 mb-4">
        {getRoundIndicators()}
      </div>
      
      {/* Bottom Row - Score and Progress */}
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{score}</div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            Question {currentQuestion + 1} of {totalQuestions}
          </div>
          <div className="text-sm text-gray-600">Progress</div>
        </div>
        
        <ReactionTimeMeter avgTime={averageReactionTime} />
      </div>
    </motion.div>
  )
}

// Temperature Meter Component
interface ReactionTimeMeterProps {
  avgTime: number
}

function ReactionTimeMeter({ avgTime }: ReactionTimeMeterProps) {
  // If no reactions yet, show neutral state
  if (avgTime === 0) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🌡️</span>
          <div className="text-2xl font-bold text-gray-400">--</div>
        </div>
        <div className="text-sm text-gray-600">Avg Speed</div>
      </div>
    )
  }
  
  // Determine temperature based on average reaction time
  const getTemperature = () => {
    if (avgTime < 3) {
      return { 
        emoji: '🔥', 
        color: 'text-red-500', 
        bgColor: 'bg-red-100',
        label: 'Hot',
        description: 'Lightning Fast!'
      }
    }
    if (avgTime < 5) {
      return { 
        emoji: '🌡️', 
        color: 'text-orange-500', 
        bgColor: 'bg-orange-100',
        label: 'Warm',
        description: 'Great Speed'
      }
    }
    if (avgTime < 7) {
      return { 
        emoji: '❄️', 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-100',
        label: 'Cool',
        description: 'Good Pace'
      }
    }
    return { 
      emoji: '🧊', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-200',
      label: 'Cold',
      description: 'Take Your Time'
    }
  }
  
  const temp = getTemperature()
  
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <motion.span 
          key={temp.emoji}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-2xl"
        >
          {temp.emoji}
        </motion.span>
        <div className={`text-2xl font-bold ${temp.color}`}>
          {avgTime.toFixed(1)}s
        </div>
      </div>
      <div className={`inline-block ${temp.bgColor} ${temp.color} px-3 py-1 rounded-full text-xs font-semibold mb-1`}>
        {temp.label}
      </div>
      <div className="text-xs text-gray-600">{temp.description}</div>
    </div>
  )
}