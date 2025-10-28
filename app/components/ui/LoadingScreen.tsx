'use client'

import { motion } from 'motion/react'
import { LoadingAnimation } from '../animations/LottieWrapper'

interface LoadingScreenProps {
  message?: string
  submessage?: string
  className?: string
}

export default function LoadingScreen({
  message = "Loading...",
  submessage,
  className = ''
}: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        flex flex-col items-center justify-center min-h-[400px] 
        space-y-6 p-8 text-center ${className}
      `}
    >
      {/* Lottie Loading Animation */}
      <LoadingAnimation size="lg" />
      
      {/* Main message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="text-xl font-poppins font-semibold text-text-primary">
          {message}
        </h2>
        
        {submessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary font-poppins"
          >
            {submessage}
          </motion.p>
        )}
      </motion.div>

      {/* Animated dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex space-x-1"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 bg-primary-500 rounded-full"
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

// Specialized loading screens
export function QuizLoadingScreen() {
  return (
    <LoadingScreen
      message="Preparing your quiz"
      submessage="Fetching questions and setting up the game..."
    />
  )
}

export function DataLoadingScreen() {
  return (
    <LoadingScreen
      message="Loading data"
      submessage="Please wait while we fetch the latest content..."
    />
  )
}

export function ResultsLoadingScreen() {
  return (
    <LoadingScreen
      message="Calculating results"
      submessage="Analyzing your performance..."
    />
  )
}