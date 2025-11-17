'use client'

import { ReactNode } from 'react'

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
  const baseClasses = 'font-poppins font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95'
  
  const variantClasses = {
    primary: 'bg-[#8B7FC8] text-white hover:bg-[#6B5FA8] focus:ring-[#8B7FC8]',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500',
    success: 'bg-green-400 text-white hover:bg-green-500 focus:ring-green-400',
    warning: 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 focus:ring-yellow-400',
    danger: 'bg-red-400 text-white hover:bg-red-500 focus:ring-red-400',
    outline: 'bg-transparent border-2 border-[#8B7FC8] text-[#8B7FC8] hover:bg-[#B4A5E8] hover:bg-opacity-10 focus:ring-[#8B7FC8]'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
      role="button"
      aria-disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}