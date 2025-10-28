'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'

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
    sm: 'p-3',
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3
      }}
      whileHover={hoverable || onClick ? {
        scale: 1.02,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      } : {}}
      whileTap={onClick ? {
        scale: 0.98
      } : {}}
      className="w-full"
    >
      {cardContent}
    </motion.div>
  )
}