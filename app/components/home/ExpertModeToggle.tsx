'use client'

import { motion } from 'motion/react'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { trackEvent } from '@/lib/analytics'

export default function ExpertModeToggle() {
  const { expertModeEnabled, setExpertModeEnabled } = useUserPreferences()

  const handleToggle = () => {
    const newValue = !expertModeEnabled
    
    // Track expert mode toggle
    trackEvent('expert_mode_toggled', {
      enabled: newValue,
      context: 'home_page'
    })
    
    setExpertModeEnabled(newValue)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-lg"
    >
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">
          Expert Mode
        </h3>
        <p className="text-sm text-gray-600">
          {expertModeEnabled 
            ? 'Medium & Hard questions only' 
            : 'Easy questions with some medium'
          }
        </p>
      </div>
      
      <motion.button
        className={`
          relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          ${expertModeEnabled ? 'bg-purple-500' : 'bg-gray-300'}
        `}
        onClick={handleToggle}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{
            x: expertModeEnabled ? 24 : 2
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      </motion.button>
    </motion.div>
  )
}