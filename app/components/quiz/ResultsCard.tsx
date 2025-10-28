'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface ResultsCardProps {
  questionNumber: number
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  userAnswer?: 'A' | 'B' | 'C' | 'D'
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  isCorrect: boolean
}

export default function ResultsCard({
  questionNumber,
  question,
  options,
  userAnswer,
  correctAnswer,
  explanation,
  isCorrect
}: ResultsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get option styling based on correctness and user selection
  const getOptionStyling = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const isUserAnswer = userAnswer === optionKey
    const isCorrectOption = correctAnswer === optionKey
    
    if (isCorrectOption) {
      return 'bg-success-100 border-success-300 text-success-800'
    }
    
    if (isUserAnswer && !isCorrect) {
      return 'bg-danger-100 border-danger-300 text-danger-800'
    }
    
    return 'bg-gray-50 border-gray-200 text-text-secondary'
  }

  // Get icon for each option
  const getOptionIcon = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const isUserAnswer = userAnswer === optionKey
    const isCorrectOption = correctAnswer === optionKey
    
    if (isCorrectOption) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
          className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )
    }
    
    if (isUserAnswer && !isCorrect) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
          className="w-5 h-5 bg-danger-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.div>
      )
    }
    
    return (
      <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <motion.div
      layout
      className={`
        p-6 rounded-2xl border-2 bg-white shadow-sm
        ${isCorrect ? 'border-success-200' : 'border-danger-200'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Question number */}
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${isCorrect ? 'bg-success-500 text-white' : 'bg-danger-500 text-white'}
          `}>
            {questionNumber}
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex items-center gap-1 text-success-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-semibold">Correct</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex items-center gap-1 text-danger-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm font-semibold">Incorrect</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Expand button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-text-primary font-poppins font-medium leading-relaxed">
          {question}
        </p>
      </div>

      {/* Answer Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {Object.entries(options).map(([optionKey, optionText]) => (
          <motion.div
            key={optionKey}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * ['A', 'B', 'C', 'D'].indexOf(optionKey) }}
            className={`
              flex items-center gap-3 p-3 rounded-lg border-2 transition-all
              ${getOptionStyling(optionKey as 'A' | 'B' | 'C' | 'D')}
            `}
          >
            {getOptionIcon(optionKey as 'A' | 'B' | 'C' | 'D')}
            <span className="text-sm font-poppins font-medium flex-1">
              {optionText}
            </span>
          </motion.div>
        ))}
      </div>

      {/* User Answer Status */}
      <div className="flex flex-col gap-2 text-sm font-poppins mb-4">
        <span className="text-text-secondary">
          Your answer: 
          <span className={`ml-1 font-semibold ${userAnswer ? (isCorrect ? 'text-success-600' : 'text-danger-600') : 'text-gray-500'}`}>
            {userAnswer ? options[userAnswer] : 'No answer'}
          </span>
        </span>
        
        <span className="text-text-secondary">
          Correct answer: 
          <span className="ml-1 font-semibold text-success-600">
            {options[correctAnswer]}
          </span>
        </span>
      </div>

      {/* Explanation (Expandable) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 pt-4"
          >
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">Explanation:</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}