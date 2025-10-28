'use client'

import { motion, PanInfo } from 'motion/react'
import { ReactNode } from 'react'
import { handleSwipeGesture, SwipeGestureConfig } from '@/lib/mobile-gestures'

interface SwipeableQuestionCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  disabled?: boolean
}

export default function SwipeableQuestionCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  disabled = false
}: SwipeableQuestionCardProps) {
  
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return
    
    const swipeConfig: SwipeGestureConfig = {
      threshold: 50,
      velocity: 300,
      onSwipeLeft,
      onSwipeRight,
    }
    
    handleSwipeGesture(event, info, swipeConfig)
  }

  return (
    <motion.div
      className={`touch-pan-y ${className}`}
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onPanEnd={handlePanEnd}
      whileDrag={{ 
        scale: 0.98,
        rotateZ: 0.5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
      
      {/* Swipe indicators */}
      {!disabled && (onSwipeLeft || onSwipeRight) && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-xs text-gray-400 opacity-60">
          {onSwipeRight && (
            <div className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </div>
          )}
          {onSwipeLeft && (
            <div className="flex items-center">
              <span>Next</span>
              <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}