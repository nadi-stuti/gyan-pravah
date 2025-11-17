'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  duration: number
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
        
        if (newTime <= 5) {
          setIsCritical(true)
        } else if (newTime <= 10) {
          setIsWarning(true)
        }
        
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
    if (isCritical) return 'text-red-400'
    if (isWarning) return 'text-yellow-400'
    return 'text-[#8B7FC8]'
  }
  
  const getProgressColor = () => {
    if (isCritical) return '#F87171'
    if (isWarning) return '#FBBF24'
    return '#8B7FC8'
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
          className="text-gray-200"
        />
        
        {/* Progress circle */}
        {showProgress && (
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getProgressColor()}
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-in-out"
          />
        )}
      </svg>
      
      {/* Timer text */}
      <div
        className={`absolute inset-0 flex items-center justify-center font-poppins font-bold ${getTimerColor()} ${isCritical ? 'animate-pulse' : ''}`}
      >
        {timeRemaining}
      </div>
      
      {/* Pulse effect for critical time */}
      {isCritical && (
        <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
      )}
    </div>
  )
}