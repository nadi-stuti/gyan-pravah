'use client'

import { useRouter } from 'next/navigation'
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
    <button
      onClick={handleClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102 active:scale-98'} transition-transform duration-200`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}