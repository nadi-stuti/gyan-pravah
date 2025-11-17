'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { QuizQuestion } from '@gyan-pravah/types'

interface FactsCardProps {
  className?: string
}

export default function FactsCard({ className = '' }: FactsCardProps) {
  const [currentFact, setCurrentFact] = useState<QuizQuestion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(30)

  const fetchRandomFact = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch a random question for its explanation from our API
      const response = await fetch('/api/random-fact?mode=normal&count=5')
      
      if (!response.ok) {
        throw new Error('Failed to fetch random fact')
      }
      
      const questions: QuizQuestion[] = await response.json()
      
      if (questions.length > 0) {
        // Pick a random question from the returned set
        const randomIndex = Math.floor(Math.random() * questions.length)
        setCurrentFact(questions[randomIndex])
      }
    } catch (error) {
      console.error('Failed to fetch random fact:', error)
      // Keep the current fact if there's an error, don't clear it
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRandomFact()
  }, [fetchRandomFact])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchRandomFact()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fetchRandomFact])

  const handleGetFactNow = () => {
    setTimeLeft(30)
    fetchRandomFact()
  }

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const getTopicColor = (topicSlug?: string) => {
    // Using design system approved colors
    const colors = {
      'dham': 'bg-orange-500 text-white', // Dham color from design system
      'sant': 'bg-indigo-500 text-white', // Sant color from design system
      'shastra': 'bg-amber-500 text-white', // Shastras color from design system
      'granth': 'bg-violet-500 text-white', // Granth color from design system
      'bhagvan': 'bg-red-500 text-white', // Bhagvan color from design system
      'utsav': 'bg-emerald-500 text-white', // Utsav color from design system
      'nadi': 'bg-blue-500 text-white', // Nadi color from design system
      'default': 'bg-gray-300 text-gray-800'
    }
    return colors[topicSlug as keyof typeof colors] || colors.default
  }

  const getSubtopicColor = (topicSlug?: string) => {
    // Lighter versions of topic colors for subtopics
    const colors = {
      'dham': 'bg-orange-100 text-orange-800 border border-orange-200',
      'sant': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'shastra': 'bg-amber-100 text-amber-800 border border-amber-200',
      'granth': 'bg-violet-100 text-violet-800 border border-violet-200',
      'bhagvan': 'bg-red-100 text-red-800 border border-red-200',
      'utsav': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'nadi': 'bg-blue-100 text-blue-800 border border-blue-200',
      'default': 'bg-gray-100 text-gray-700 border border-gray-200'
    }
    return colors[topicSlug as keyof typeof colors] || colors.default
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`bg-white rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#8B7FC8] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">
            💡 Did You Know?
          </h3>
        </div>
        
        {/* Timer */}
        <motion.div 
          className="flex items-center gap-2 text-sm"
          animate={{ 
            color: timeLeft <= 5 ? '#F87171' : '#6b7280',
            scale: timeLeft <= 5 ? [1, 1.05, 1] : 1
          }}
          transition={{ 
            duration: timeLeft <= 5 ? 0.5 : 0,
            repeat: timeLeft <= 5 ? Infinity : 0
          }}
        >
          <motion.svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: timeLeft <= 10 ? 360 : 0 }}
            transition={{ duration: 2, repeat: timeLeft <= 10 ? Infinity : 0, ease: "linear" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </motion.svg>
          <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-[#8B7FC8] rounded-full animate-spin"></div>
              <span className="text-sm">Loading fascinating fact...</span>
            </div>
          </motion.div>
        ) : currentFact ? (
          <motion.div
            key={currentFact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Topic Pills */}
            <div className="flex flex-wrap gap-2">
              {currentFact.quiz_topic && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTopicColor(currentFact.quiz_topic.slug)}`}>
                  {currentFact.quiz_topic.topicName}
                </span>
              )}
              {currentFact.quiz_subtopic && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubtopicColor(currentFact.quiz_topic?.slug)}`}>
                  {currentFact.quiz_subtopic.name}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentFact.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentFact.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentFact.difficulty}
              </span>
            </div>

            {/* Question (as context) */}
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">Q</span>
                </div>
                <div>
                  <p className="text-sm text-indigo-800 font-medium mb-2">Context Question:</p>
                  <p className="text-sm text-indigo-900 leading-relaxed">{currentFact.question}</p>
                </div>
              </div>
            </div>

            {/* Explanation (the main fact) */}
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-emerald-800 font-medium mb-2">💡 Fascinating Fact:</p>
                  <motion.p 
                    className="text-emerald-900 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {currentFact.explanation}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-gray-500"
          >
            <p className="text-sm">Unable to load fact. Please try again.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Get Fact Now Button */}
      <motion.button
        onClick={handleGetFactNow}
        disabled={isLoading}
        className="w-full mt-4 bg-[#8B7FC8] text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-[#6B5FA8] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Get New Fact Now
          </span>
        )}
      </motion.button>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full"
            style={{
              backgroundColor: timeLeft <= 5 ? '#F87171' : '#8B7FC8'
            }}
            initial={{ width: '100%' }}
            animate={{ 
              width: `${(timeLeft / 30) * 100}%`
            }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <motion.p 
          className="text-xs mt-2 text-center font-medium"
          animate={{ 
            color: timeLeft <= 5 ? '#F87171' : '#6b7280'
          }}
        >
          {timeLeft <= 5 ? '⚡ New fact coming soon!' : `Next fact in ${timeLeft} seconds`}
        </motion.p>
      </div>
    </motion.div>
  )
}