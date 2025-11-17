'use client'

import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

interface BackButtonProps {
  to?: string
  className?: string
  children?: React.ReactNode
  onBack?: () => void
}

export default function BackButton({ 
  to, 
  className = '', 
  children,
  onBack 
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    trackEvent('back_button_clicked', {
      from_page: window.location.pathname,
      to_page: to || 'browser_back'
    })

    if (onBack) {
      onBack()
    } else if (to) {
      router.push(to)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 ${className}`}
    >
      {children || (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </button>
  )
}