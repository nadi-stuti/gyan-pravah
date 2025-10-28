'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
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
    <motion.button
      onClick={handleBack}
      className={`p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children || (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </motion.button>
  )
}