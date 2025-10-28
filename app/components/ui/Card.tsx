'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { cardAnimationVariants, getAccessibleVariants } from '@/lib/mobile-animations'
import { handleTouchPress } from '@/lib/mobile-gestures'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
  onClick?: () => void
  hoverable?: boolean
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  animate = true,
  onClick,
  hoverable = false
}: CardProps) {
  const baseClasses = 'bg-background-card rounded-2xl font-poppins'
  
  const variantClasses = {
    default: 'shadow-card',
    elevated: 'shadow-card-hover',
    outlined: 'border-2 border-neutral-200 shadow-none'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  const interactiveClasses = onClick || hoverable ? 'cursor-pointer' : ''
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`
  
  const cardContent = (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
  
  if (!animate) {
    return cardContent
  }
  
  return (
    <motion.div
      variants={getAccessibleVariants(cardAnimationVariants)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={hoverable || onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick ? () => handleTouchPress(onClick) : undefined}
      className="w-full"
    >
      {cardContent}
    </motion.div>
  )
}