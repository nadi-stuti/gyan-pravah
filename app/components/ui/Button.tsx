'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { buttonAnimationVariants, getAccessibleVariants } from '@/lib/mobile-animations'
import { handleTouchPress } from '@/lib/mobile-gestures'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'font-poppins font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-button',
    secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus:ring-neutral-500 shadow-button',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-button',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-button',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-button',
    outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-touch',
    md: 'px-4 py-3 text-base min-h-touch-lg',
    lg: 'px-6 py-4 text-lg min-h-touch-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`
  
  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || isLoading}
      variants={getAccessibleVariants(buttonAnimationVariants)}
      initial="initial"
      animate="animate"
      whileHover={!disabled && !isLoading ? "hover" : undefined}
      whileTap={!disabled && !isLoading ? "tap" : undefined}
      onClick={onClick ? () => handleTouchPress(onClick) : undefined}
      type={type}
      // Mobile accessibility
      role="button"
      aria-disabled={disabled || isLoading}
    >
      {isLoading ? (
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          Loading...
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  )
}