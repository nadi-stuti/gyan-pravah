'use client'

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
      let status: 'pending' | 'current' | 'correct' | 'incorrect' | 'skipped' = 'pending'
      const isBonus = i >= 6
      
      if (i < currentQuestion) {
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
      
      // Determine colors based on status - using design system colors
      let colorClasses = ''
      if (status === 'correct') {
        colorClasses = isBonus 
          ? 'bg-[#F97316] text-white border-[#F97316]' 
          : 'bg-green-400 text-white border-green-400'
      } else if (status === 'incorrect') {
        colorClasses = 'bg-red-400 text-white border-red-400'
      } else if (status === 'skipped') {
        colorClasses = 'bg-gray-300 text-white border-gray-300'
      } else if (status === 'current') {
        colorClasses = 'bg-yellow-400 text-gray-900 border-yellow-400'
      } else {
        colorClasses = isBonus 
          ? 'bg-[#FDBA74] text-[#F97316] border-[#FDBA74]'
          : 'bg-gray-300 text-gray-600 border-gray-300'
      }
      
      indicators.push(
        <div
          key={i}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${colorClasses}`}
        >
          {isBonus ? '★' : i + 1}
        </div>
      )
    }
    return indicators
  }

  return (
    <div className={`bg-white rounded-2xl p-4 mb-6 ${className}`}>
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
    </div>
  )
}

// Simplified Reaction Time Meter Component
interface ReactionTimeMeterProps {
  avgTime: number
}

function ReactionTimeMeter({ avgTime }: ReactionTimeMeterProps) {
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
        color: 'text-red-400', 
        bgColor: 'bg-red-400',
        label: 'Hot',
        description: 'Lightning Fast!'
      }
    }
    if (avgTime < 5) {
      return { 
        emoji: '🌡️', 
        color: 'text-[#F97316]', 
        bgColor: 'bg-[#F97316]',
        label: 'Warm',
        description: 'Great Speed'
      }
    }
    if (avgTime < 7) {
      return { 
        emoji: '❄️', 
        color: 'text-blue-400', 
        bgColor: 'bg-blue-400',
        label: 'Cool',
        description: 'Good Pace'
      }
    }
    return { 
      emoji: '🧊', 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-500',
      label: 'Cold',
      description: 'Take Your Time'
    }
  }
  
  const temp = getTemperature()
  
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-2xl">{temp.emoji}</span>
        <div className={`text-2xl font-bold ${temp.color}`}>
          {avgTime.toFixed(1)}s
        </div>
      </div>
      <div className={`inline-block ${temp.bgColor} text-white px-3 py-1 rounded-full text-xs font-semibold mb-1`}>
        {temp.label}
      </div>
      <div className="text-xs text-gray-600">{temp.description}</div>
    </div>
  )
}