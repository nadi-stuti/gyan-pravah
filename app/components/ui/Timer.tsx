'use client'

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface TimerProps {
  duration: number // Duration in seconds
  onTimeUp?: () => void
  isActive?: boolean
  className?: string
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Timer({
  duration,
  onTimeUp,
  isActive = true,
  className = '',
  showProgress = true,
  size = 'md'
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)
  
  useEffect(() => {
    setTimeRemaining(duration)
    setIsWarning(false)
    setIsCritical(false)
  }, [duration])
  
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1
        
        // Set warning states based on remaining time
        if (newTime <= 5) {
          setIsCritical(true)
        } else if (newTime <= 10) {
          setIsWarning(true)
        }
        
        // Call onTimeUp when timer reaches 0
        if (newTime <= 0) {
          onTimeUp?.()
          return 0
        }
        
        return newTime
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [isActive, timeRemaining, onTimeUp])
  
  const progress = (timeRemaining / duration) * 100
  
  const sizeClasses = {
    sm: 'w-16 h-16 text-sm',
    md: 'w-20 h-20 text-base',
    lg: 'w-24 h-24 text-lg'
  }
  
  const getTimerColor = () => {
    if (isCritical) return 'text-danger-500'
    if (isWarning) return 'text-warning-500'
    return 'text-primary-500'
  }
  
  const getProgressColor = () => {
    if (isCritical) return '#ef4444' // danger-500
    if (isWarning) return '#f59e0b' // warning-500
    return '#a855f7' // primary-500
  }
  
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Background circle */}
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-neutral-200"
        />
        
        {/* Progress circle */}
        {showProgress && (
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke={getProgressColor()}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100)
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeInOut" 
            }}
          />
        )}
      </svg>
      
      {/* Timer text */}
      <motion.div
        className={`absolute inset-0 flex items-center justify-center font-poppins font-bold ${getTimerColor()}`}
        animate={isCritical ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={isCritical ? {
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        {timeRemaining}
      </motion.div>
      
      {/* Pulse effect for critical time */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-danger-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  )
}