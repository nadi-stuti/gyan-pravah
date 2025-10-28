'use client'

import { motion } from 'motion/react'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
  showLabels?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export default function ProgressBar({
  current,
  total,
  className = '',
  showLabels = true,
  variant = 'default',
  size = 'md',
  animated = true
}: ProgressBarProps) {
  const progress = Math.min((current / total) * 100, 100)
  
  const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500'
  }
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Labels */}
      {showLabels && (
        <div className={`flex justify-between items-center mb-2 font-poppins ${textSizeClasses[size]}`}>
          <span className="text-text-secondary">
            Question {current} of {total}
          </span>
          <motion.span
            className="text-text-primary font-medium"
            key={progress}
            initial={animated ? { scale: 0.8, opacity: 0 } : {}}
            animate={animated ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        {/* Progress bar fill */}
        <motion.div
          className={`h-full rounded-full ${variantClasses[variant]}`}
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={animated ? {
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 20
          } : {}}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber <= current
          const isCurrent = stepNumber === current
          
          return (
            <motion.div
              key={stepNumber}
              className={`w-2 h-2 rounded-full ${
                isCompleted 
                  ? variantClasses[variant]
                  : isCurrent
                  ? 'bg-neutral-400'
                  : 'bg-neutral-200'
              }`}
              initial={animated ? { scale: 0 } : {}}
              animate={animated ? { 
                scale: isCurrent ? 1.2 : 1,
                opacity: 1
              } : {}}
              transition={animated ? {
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
              } : {}}
              whileHover={{ scale: 1.3 }}
            />
          )
        })}
      </div>
    </div>
  )
}