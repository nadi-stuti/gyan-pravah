'use client'

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { QuizQuestion } from '@gyan-pravah/types'
import { getQuizConfig } from '@/lib/quiz-config'
import { questionCardVariants, answerOptionVariants, getAccessibleVariants } from '@/lib/mobile-animations'
import { handleTouchPress } from '@/lib/mobile-gestures'

interface QuestionCardProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  timeRemaining: number
  onTimeUp: () => void
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void
  selectedAnswer?: 'A' | 'B' | 'C' | 'D'
  isAnswered: boolean
  className?: string
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  onTimeUp,
  onAnswer,
  selectedAnswer,
  isAnswered,
  className = ''
}: QuestionCardProps) {
  const config = getQuizConfig('quizup')
  const maxTime = config.questionTimeLimit
  
  // State for reading timer (3 seconds before showing options)
  const [readingTime, setReadingTime] = useState(3)
  const [showOptions, setShowOptions] = useState(false)
  
  // Shuffle answers order to prevent pattern recognition
  const [shuffledOptions, setShuffledOptions] = useState<Array<{key: 'A' | 'B' | 'C' | 'D', text: string}>>([])
  
  // Initialize shuffled options when question changes
  useEffect(() => {
    const options = Object.entries(question.options).map(([key, text]) => ({
      key: key as 'A' | 'B' | 'C' | 'D',
      text
    }))
    
    // Fisher-Yates shuffle algorithm
    const shuffled = [...options]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    setShuffledOptions(shuffled)
    setReadingTime(3)
    setShowOptions(false)
  }, [question.id, question.options])
  
  // Reading timer countdown
  useEffect(() => {
    if (readingTime > 0) {
      const timer = setTimeout(() => {
        setReadingTime(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setShowOptions(true)
    }
  }, [readingTime])
  
  return (
    <motion.div
      key={question.id}
      variants={getAccessibleVariants(questionCardVariants)}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full max-w-lg mx-auto px-2 sm:px-0 ${className}`}
    >
      {/* Question Card - White background like reference */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-mobile-card sm:shadow-lg">
        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: questionNumber > 6 ? '#F59E0B' : '#FBBF24' }}>
            {questionNumber > 6 ? '🎯 BONUS ROUND' : (question.quiz_subtopic?.name || question.quiz_subtopic?.quiz_topic?.topicName || 'General Knowledge')}
          </span>
        </motion.div>

        {/* Question text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center mb-4 sm:mb-6"
        >
          <h2 className="text-base sm:text-lg md:text-xl font-poppins font-semibold text-gray-900 leading-relaxed px-2">
            {question.question}
          </h2>
        </motion.div>

        {/* Divider with padding */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-4 sm:mb-6 px-4 sm:px-8"
        >
          <div className="h-px bg-gray-200"></div>
        </motion.div>

        {/* Reading Timer or Main Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 sm:mb-6"
        >
          {!showOptions ? (
            // Reading timer (3 seconds)
            <div className="text-center">
              <motion.div
                key={readingTime}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#8B7FC8] text-white text-xl sm:text-2xl font-bold mb-2"
              >
                {readingTime}
              </motion.div>
              <p className="text-sm text-gray-600 font-poppins">
                Read the question carefully...
              </p>
            </div>
          ) : (
            // Main quiz timer
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${questionNumber > 6 ? 'bg-orange-500' : 'bg-green-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeRemaining / maxTime) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full">
                <div className="bg-white border-2 border-gray-300 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{timeRemaining}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Answer options - only show after reading timer */}
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ShuffledAnswerOptions
              question={question}
              shuffledOptions={shuffledOptions}
              selectedAnswer={selectedAnswer}
              onAnswer={onAnswer}
              isDisabled={isAnswered}
              showCorrectAnswer={isAnswered}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Shuffled Answer Options Component
interface ShuffledAnswerOptionsProps {
  question: QuizQuestion
  shuffledOptions: Array<{key: 'A' | 'B' | 'C' | 'D', text: string}>
  selectedAnswer?: 'A' | 'B' | 'C' | 'D'
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void
  isDisabled?: boolean
  showCorrectAnswer?: boolean
  className?: string
}

function ShuffledAnswerOptions({
  question,
  shuffledOptions,
  selectedAnswer,
  onAnswer,
  isDisabled = false,
  showCorrectAnswer = false,
  className = ''
}: ShuffledAnswerOptionsProps) {
  
  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`}>
      {shuffledOptions.map(({ key: optionKey, text: optionText }, index) => {
        const option = optionKey as 'A' | 'B' | 'C' | 'D'
        const isSelected = selectedAnswer === option
        const isCorrect = question.correctOption === option
        const isWrong = showCorrectAnswer && isSelected && !isCorrect
        
        return (
          <ShuffledAnswerOption
            key={`${question.id}-${optionKey}`}
            option={option}
            text={optionText}
            isSelected={isSelected}
            isCorrect={showCorrectAnswer ? isCorrect : undefined}
            isWrong={isWrong}
            isDisabled={isDisabled}
            onClick={() => onAnswer(option)}
            animationDelay={index * 0.1}
          />
        )
      })}
    </div>
  )
}

// Individual Shuffled Answer Option Component
interface ShuffledAnswerOptionProps {
  option: 'A' | 'B' | 'C' | 'D'
  text: string
  isSelected: boolean
  isCorrect?: boolean
  isWrong?: boolean
  isDisabled: boolean
  onClick: () => void
  animationDelay: number
}

function ShuffledAnswerOption({
  option,
  text,
  isSelected,
  isCorrect,
  isWrong,
  isDisabled,
  onClick,
  animationDelay
}: ShuffledAnswerOptionProps) {
  
  // Determine the visual state
  const getOptionState = () => {
    if (isWrong) return 'wrong'
    if (isCorrect) return 'correct'
    if (isSelected) return 'selected'
    return 'default'
  }
  
  const optionState = getOptionState()
  
  // Style classes based on state - following design system rules (no gradients)
  const getStateClasses = () => {
    switch (optionState) {
      case 'correct':
        return 'border-green-400 bg-green-400 text-white'
      case 'wrong':
        return 'border-red-400 bg-red-400 text-white'
      case 'selected':
        return 'border-[#8B7FC8] bg-[#8B7FC8] text-white'
      default:
        return 'border-gray-200 bg-white text-gray-900 hover:border-[#B4A5E8] hover:bg-[#B4A5E8] hover:text-white'
    }
  }
  
  return (
    <motion.button
      variants={getAccessibleVariants(answerOptionVariants)}
      initial="initial"
      animate="animate"
      whileHover={!isDisabled && optionState === 'default' ? "hover" : undefined}
      whileTap={!isDisabled ? "tap" : undefined}
      custom={animationDelay * 10} // Convert to index for stagger
      onClick={() => handleTouchPress(onClick)}
      disabled={isDisabled}
      className={`
        w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-150 text-left
        font-poppins font-medium text-sm sm:text-base min-h-touch
        disabled:cursor-not-allowed transform touch-manipulation
        ${getStateClasses()}
        ${isDisabled && optionState === 'default' ? 'opacity-60' : ''}
      `}
      // Mobile accessibility
      role="button"
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
    >
      <div className="flex items-center">
        {/* Option text */}
        <span className="flex-1 px-2 sm:px-4">
          {text}
        </span>
        
        {/* State indicator */}
        {optionState === 'correct' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
        
        {optionState === 'wrong' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}