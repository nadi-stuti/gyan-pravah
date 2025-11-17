'use client'

import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { trackEvent } from '@/lib/analytics'

export default function PlayNowButton() {
  const router = useRouter()
  const { expertModeEnabled } = useUserPreferences()

  const handlePlayNow = () => {
    // Track play now button click
    trackEvent('play_now_clicked', {
      is_expert_mode: expertModeEnabled,
      is_first_visit: false // PlayNowButton is only shown to returning users
    })
    
    // Navigate to random quiz page
    // Questions will be fetched server-side
    const mode = expertModeEnabled ? 'expert' : 'normal'
    router.push(`/quiz/random?mode=${mode}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: 0.1
      }}
      className="w-full"
    >
      <button
        onClick={handlePlayNow}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg sm:text-xl min-h-touch-lg touch-manipulation"
        role="button"
      >
        🚀 Play Now
      </button>
      
      <motion.p 
        className="text-center text-white opacity-90 text-xs sm:text-sm mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Random questions • {expertModeEnabled ? 'Expert Mode' : 'Normal Mode'}
      </motion.p>
    </motion.div>
  )
}