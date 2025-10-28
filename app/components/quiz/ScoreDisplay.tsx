'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { CelebrationAnimation } from '../animations/LottieWrapper'

interface ScoreDisplayProps {
  score: number
  totalPossible: number
  percentage: number
  totalQuestions: number
}

export default function ScoreDisplay({
  score,
  totalPossible,
  percentage,
  totalQuestions
}: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    // Animate score counting up
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const scoreIncrement = score / steps
    const percentageIncrement = percentage / steps
    
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setAnimatedScore(Math.min(Math.round(scoreIncrement * currentStep), score))
      setAnimatedPercentage(Math.min(Math.round(percentageIncrement * currentStep), percentage))
      
      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score, percentage])

  // Get performance color based on percentage
  const getPerformanceColor = (perc: number) => {
    if (perc >= 80) return 'text-success-600'
    if (perc >= 60) return 'text-warning-600'
    return 'text-danger-600'
  }

  // Get performance background based on percentage
  const getPerformanceBg = (perc: number) => {
    if (perc >= 80) return 'bg-success-50 border-success-200'
    if (perc >= 60) return 'bg-warning-50 border-warning-200'
    return 'bg-danger-50 border-danger-200'
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.6 
      }}
      className={`
        relative p-8 rounded-3xl border-2 text-center max-w-md mx-auto
        ${getPerformanceBg(percentage)}
      `}
    >
      {/* Celebration animation for high scores */}
      {percentage >= 80 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <CelebrationAnimation 
            size="xl" 
            className="opacity-80"
          />
        </div>
      )}

      {/* Celebration particles for high scores */}
      {percentage >= 80 && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: '50%',
                y: '50%'
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`
              }}
              transition={{
                duration: 2,
                delay: 1 + i * 0.1,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 bg-success-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Main Score */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-2xl font-poppins font-bold text-text-primary mb-2">
          Quiz Complete!
        </h1>
        
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.5, 
              type: "spring", 
              stiffness: 400,
              damping: 20 
            }}
            className={`text-6xl font-bold font-poppins ${getPerformanceColor(percentage)}`}
          >
            {animatedScore}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-text-secondary font-poppins"
          >
            out of {totalPossible} points
          </motion.div>
        </div>
      </motion.div>

      {/* Percentage Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 1, 
          type: "spring", 
          stiffness: 300,
          damping: 25 
        }}
        className="relative w-32 h-32 mx-auto mb-4"
      >
        {/* Background circle */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getPerformanceColor(percentage)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ 
              duration: 1.5, 
              delay: 1.2,
              ease: "easeInOut" 
            }}
            style={{
              strokeDasharray: `${2 * Math.PI * 50}`,
              strokeDashoffset: `${2 * Math.PI * 50 * (1 - percentage / 100)}`
            }}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.3 }}
            className={`text-2xl font-bold font-poppins ${getPerformanceColor(percentage)}`}
          >
            {animatedPercentage}%
          </motion.span>
        </div>
      </motion.div>

      {/* Questions Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.4 }}
        className="text-text-secondary font-poppins"
      >
        <div className="text-sm">
          {Math.round((animatedPercentage / 100) * totalQuestions)} out of {totalQuestions} questions correct
        </div>
      </motion.div>

      {/* Performance Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          delay: 2, 
          type: "spring", 
          stiffness: 400,
          damping: 25 
        }}
        className="mt-4"
      >
        <span className={`
          inline-block px-4 py-2 rounded-full text-sm font-semibold font-poppins
          ${percentage >= 80 ? 'bg-success-100 text-success-700' : ''}
          ${percentage >= 60 && percentage < 80 ? 'bg-warning-100 text-warning-700' : ''}
          ${percentage >= 40 && percentage < 60 ? 'bg-blue-100 text-blue-700' : ''}
          ${percentage < 40 ? 'bg-danger-100 text-danger-700' : ''}
        `}>
          {percentage >= 80 && "🏆 Excellent!"}
          {percentage >= 60 && percentage < 80 && "⭐ Great Job!"}
          {percentage >= 40 && percentage < 60 && "👍 Good Effort!"}
          {percentage < 40 && "💪 Keep Trying!"}
        </span>
      </motion.div>
    </motion.div>
  )
}