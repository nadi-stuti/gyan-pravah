'use client'

import { motion, AnimatePresence } from 'motion/react'
import { QuizQuestion } from '@gyan-pravah/types'
import { SuccessAnimation, FailureAnimation } from '../animations/LottieWrapper'

interface AnswerOptionsProps {
  question: QuizQuestion
  selectedAnswer?: 'A' | 'B' | 'C' | 'D'
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void
  isDisabled?: boolean
  showCorrectAnswer?: boolean
  className?: string
}

export default function AnswerOptions({
  question,
  selectedAnswer,
  onAnswer,
  isDisabled = false,
  showCorrectAnswer = false,
  className = ''
}: AnswerOptionsProps) {
  
  return (
    <div className={`space-y-3 ${className}`}>
      {Object.entries(question.options).map(([optionKey, optionText], index) => {
        const option = optionKey as 'A' | 'B' | 'C' | 'D'
        const isSelected = selectedAnswer === option
        const isCorrect = question.correctOption === option
        const isWrong = showCorrectAnswer && isSelected && !isCorrect
        
        return (
          <AnswerOption
            key={optionKey}
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

// Individual Answer Option Component
interface AnswerOptionProps {
  option: 'A' | 'B' | 'C' | 'D'
  text: string
  isSelected: boolean
  isCorrect?: boolean
  isWrong?: boolean
  isDisabled: boolean
  onClick: () => void
  animationDelay: number
}

function AnswerOption({
  option,
  text,
  isSelected,
  isCorrect,
  isWrong,
  isDisabled,
  onClick,
  animationDelay
}: AnswerOptionProps) {
  
  // Determine the visual state
  const getOptionState = () => {
    if (isWrong) return 'wrong'
    if (isCorrect) return 'correct'
    if (isSelected) return 'selected'
    return 'default'
  }
  
  const optionState = getOptionState()
  
  // Style classes based on state
  const getStateClasses = () => {
    switch (optionState) {
      case 'correct':
        return 'border-green-500 bg-green-500 text-white shadow-lg'
      case 'wrong':
        return 'border-red-500 bg-red-500 text-white shadow-lg'
      case 'selected':
        return 'border-purple-500 bg-purple-500 text-white shadow-lg'
      default:
        return 'border-gray-200 bg-white text-gray-900 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
    }
  }
  
  // Animation variants for different states
  const buttonVariants = {
    default: {
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    tap: {
      scale: 0.98
    },
    correct: {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    wrong: {
      scale: 1,
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
    }
  }
  
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={
        optionState === 'correct' ? 'correct' : 
        optionState === 'wrong' ? 'wrong' : 
        { opacity: 1, x: 0, ...buttonVariants.default }
      }
      transition={{ 
        delay: animationDelay, 
        duration: 0.3,
        type: "spring",
        stiffness: 200
      }}
      variants={buttonVariants}
      whileHover={!isDisabled && optionState === 'default' ? 'hover' : {}}
      whileTap={!isDisabled ? 'tap' : {}}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left
        font-poppins font-medium text-base
        disabled:cursor-not-allowed transform
        ${getStateClasses()}
        ${isDisabled && optionState === 'default' ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-center">
        {/* Option letter circle */}
        <OptionCircle 
          option={option} 
          state={optionState}
          isSelected={isSelected}
        />
        
        {/* Option text */}
        <span className="flex-1 px-4">
          {text}
        </span>
        
        {/* State indicator */}
        <StateIndicator state={optionState} />
      </div>
    </motion.button>
  )
}

// Option Circle Component
interface OptionCircleProps {
  option: 'A' | 'B' | 'C' | 'D'
  state: 'default' | 'selected' | 'correct' | 'wrong'
  isSelected: boolean
}

function OptionCircle({ option, state, isSelected }: OptionCircleProps) {
  const getCircleClasses = () => {
    switch (state) {
      case 'correct':
        return 'bg-white text-green-500 border-2 border-white'
      case 'wrong':
        return 'bg-white text-red-500 border-2 border-white'
      case 'selected':
        return 'bg-white text-purple-500 border-2 border-white'
      default:
        return 'bg-gray-100 text-gray-700 border-2 border-gray-100'
    }
  }
  
  return (
    <motion.div
      animate={{
        scale: isSelected || state === 'correct' || state === 'wrong' ? 1.1 : 1,
        rotate: state === 'wrong' ? [0, -5, 5, -5, 0] : 0
      }}
      transition={{ 
        duration: state === 'wrong' ? 0.5 : 0.2,
        type: "spring",
        stiffness: 300
      }}
      className={`
        shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
        font-bold text-sm transition-all duration-200
        ${getCircleClasses()}
      `}
    >
      {option}
    </motion.div>
  )
}

// State Indicator Component
interface StateIndicatorProps {
  state: 'default' | 'selected' | 'correct' | 'wrong'
}

function StateIndicator({ state }: StateIndicatorProps) {
  return (
    <AnimatePresence>
      {state !== 'default' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30 
          }}
          className="shrink-0 flex items-center justify-center"
        >
          {state === 'correct' && (
            <SuccessAnimation 
              size="sm" 
              className="w-8 h-8"
            />
          )}
          
          {state === 'wrong' && (
            <FailureAnimation 
              size="sm" 
              className="w-8 h-8"
            />
          )}
          
          {state === 'selected' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}