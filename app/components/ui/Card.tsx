'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
  hoverable?: boolean
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false
}: CardProps) {
  const baseClasses = 'bg-white rounded-2xl font-poppins transition-transform duration-200'
  
  const variantClasses = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border-2 border-gray-200'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  const interactiveClasses = onClick || hoverable ? 'cursor-pointer hover:scale-102 active:scale-98' : ''
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  )
}