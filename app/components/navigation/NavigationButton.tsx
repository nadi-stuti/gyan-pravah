'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { trackEvent } from '@/lib/analytics'
import { ReactNode } from 'react'

interface NavigationButtonProps {
  to: string
  className?: string
  children: ReactNode
  onClick?: () => void
  trackingData?: Record<string, any>
  disabled?: boolean
}

export default function NavigationButton({ 
  to, 
  className = '', 
  children,
  onClick,
  trackingData = {},
  disabled = false
}: NavigationButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled) return

    trackEvent('navigation_button_clicked', {
      from_page: window.location.pathname,
      to_page: to,
      ...trackingData
    })

    if (onClick) {
      onClick()
    }
    
    router.push(to)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}