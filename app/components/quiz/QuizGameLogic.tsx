'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { QuizQuestion } from '@gyan-pravah/types'
import { useQuizStore } from '../../stores/useQuizStore'
import QuestionCard from './QuestionCard'
import GameHeader from './GameHeader'
import { trackEvent } from '@/lib/analytics'
import { 
  getQuizConfig, 
  calculateQuestionPoints, 
  calculateMaxScore, 
  isBonusRound, 
  getQuestionTypeLabel,
  type QuizMode 
} from '@/lib/quiz-config'

interface QuizGameLogicProps {
  questions: QuizQuestion[]
  onQuizComplete: (finalScore: number, answers: Record<number, string>) => void
  quizMode?: QuizMode
  className?: string
}

export default function QuizGameLogic({
  questions,
  onQuizComplete,
  quizMode = 'quizup',
  className = ''
}: QuizGameLogicProps) {
  const config = getQuizConfig(quizMode)
  const {
    currentQuestion,
    selectedAnswers,
    timeRemaining,
    totalScore,
    pointsPerQuestion,
    setCurrentQuestion,
    setTimeRemaining,
    setQuizConfig,
    recordQuestionResult,
    recordReactionTime
  } = useQuizStore()

  const [isAnswered, setIsAnswered] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizStartTime] = useState(Date.now())
  const [isReadingPeriod, setIsReadingPeriod] = useState(true)
  const [answerPeriodStartTime, setAnswerPeriodStartTime] = useState<number | null>(null)

  // Set quiz config in store when component mounts
  useEffect(() => {
    const maxScore = calculateMaxScore(config)
    setQuizConfig(maxScore)
  }, [setQuizConfig, config])

  // Reset reading period when question changes
  useEffect(() => {
    setIsReadingPeriod(true)
    setAnswerPeriodStartTime(null)
    const readingTimer = setTimeout(() => {
      setIsReadingPeriod(false)
      setAnswerPeriodStartTime(Date.now())
    }, 3000)
    
    return () => clearTimeout(readingTimer)
  }, [currentQuestion])

  // Timer management - only count down after reading period
  useEffect(() => {
    if (isAnswered || showFeedback || isReadingPeriod) return

    const timer = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isAnswered, showFeedback, isReadingPeriod, setTimeRemaining])

  // Auto-progress when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && !isAnswered && !isReadingPeriod) {
      handleTimeUp()
    }
  }, [timeRemaining, isAnswered, isReadingPeriod])

  // Calculate points
  const calculatePoints = useCallback((remainingTime: number, questionIndex: number): number => {
    const isBonus = isBonusRound(questionIndex, config)
    return calculateQuestionPoints(true, remainingTime, isBonus, config)
  }, [config])

  // Handle answer selection
  const handleAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || isReadingPeriod || !answerPeriodStartTime) return

    const currentQ = questions[currentQuestion]
    const isCorrect = answer === currentQ.correctOption
    const points = isCorrect ? calculatePoints(timeRemaining, currentQuestion) : 0
    // Calculate actual time taken during answer period only (not including reading time)
    const timeTaken = (Date.now() - answerPeriodStartTime) / 1000
    const isBonus = isBonusRound(currentQuestion, config)
    
    // Track question answer
    trackEvent('question_answered', {
      question_id: currentQ.id,
      question_number: currentQuestion + 1,
      selected_answer: answer,
      correct_answer: currentQ.correctOption,
      is_correct: isCorrect,
      time_taken: timeTaken,
      time_remaining: timeRemaining,
      points_earned: points,
      difficulty: currentQ.difficulty,
      topic: currentQ.quiz_subtopic?.quiz_topic?.slug || 'unknown',
      subtopic: currentQ.quiz_subtopic?.slug,
      is_bonus_round: isBonus,
      question_type: getQuestionTypeLabel(currentQuestion, config)
    })
    
    recordQuestionResult(currentQuestion, answer, points, isCorrect)
    recordReactionTime(timeTaken)
    setIsAnswered(true)
    
    if (isCorrect) {
      setShowFeedback(true)
    }
    
    setTimeout(() => {
      progressToNextQuestion()
    }, 2500)
  }, [
    isAnswered, 
    isReadingPeriod,
    answerPeriodStartTime,
    questions, 
    currentQuestion, 
    timeRemaining, 
    calculatePoints, 
    recordQuestionResult,
    recordReactionTime,
    config
  ])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (isAnswered || isReadingPeriod) return
    
    const currentQ = questions[currentQuestion]
    
    trackEvent('question_timeout', {
      question_id: currentQ.id,
      question_number: currentQuestion + 1,
      correct_answer: currentQ.correctOption,
      difficulty: currentQ.difficulty,
      topic: currentQ.quiz_subtopic?.quiz_topic?.slug || 'unknown',
      subtopic: currentQ.quiz_subtopic?.slug
    })
    
    recordQuestionResult(currentQuestion, '', 0, false)
    setIsAnswered(true)
    setShowFeedback(true)
    
    setTimeout(() => {
      progressToNextQuestion()
    }, 1000)
  }, [isAnswered, isReadingPeriod, questions, currentQuestion, recordQuestionResult])

  // Progress to next question or complete quiz
  const progressToNextQuestion = useCallback(() => {
    const nextQuestionIndex = currentQuestion + 1
    
    if (nextQuestionIndex >= questions.length) {
      trackEvent('quiz_completed', {
        final_score: totalScore,
        total_possible_score: calculateMaxScore(config),
        percentage: Math.round((totalScore / calculateMaxScore(config)) * 100),
        questions_answered: questions.length,
        questions_correct: questions.filter((q, i) => selectedAnswers[i] === q.correctOption).length,
        total_questions: questions.length,
        time_taken_total: Math.round((Date.now() - quizStartTime) / 1000),
        mode: quizMode,
        topic: questions[0]?.quiz_subtopic?.quiz_topic?.slug,
        subtopic: questions[0]?.quiz_subtopic?.slug,
        difficulty: questions[0]?.difficulty,
        is_expert_mode: questions.some(q => q.difficulty === 'Hard')
      })
      
      onQuizComplete(totalScore, selectedAnswers)
      return
    }
    
    setCurrentQuestion(nextQuestionIndex)
    setTimeRemaining(config.questionTimeLimit)
    setIsAnswered(false)
    setShowFeedback(false)
  }, [
    currentQuestion, 
    questions, 
    totalScore, 
    selectedAnswers, 
    onQuizComplete, 
    setCurrentQuestion, 
    setTimeRemaining,
    quizStartTime
  ])

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(config.questionTimeLimit)
    setIsAnswered(false)
    setShowFeedback(false)
  }, [currentQuestion, setTimeRemaining, config.questionTimeLimit])

  const currentQ = questions[currentQuestion]
  const selectedAnswer = selectedAnswers[currentQuestion] as 'A' | 'B' | 'C' | 'D' | undefined

  if (!currentQ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-white font-poppins">Loading question...</div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <GameHeader
        currentQuestion={currentQuestion}
        totalQuestions={questions.length}
        score={totalScore}
      />

      <AnimatePresence mode="wait">
        <QuestionCard
          key={`question-${currentQuestion}`}
          question={currentQ}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          timeRemaining={timeRemaining}
          onTimeUp={handleTimeUp}
          onAnswer={handleAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
        />
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && selectedAnswer && (
          <ScoreFeedback
            isCorrect={selectedAnswer === currentQ.correctOption}
            points={pointsPerQuestion[currentQuestion] || 0}
            timeRemaining={timeRemaining}
            isBonusRound={isBonusRound(currentQuestion, config)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Simplified Score Feedback Component
interface ScoreFeedbackProps {
  isCorrect: boolean
  points: number
  timeRemaining: number
  isBonusRound?: boolean
}

function ScoreFeedback({ isCorrect, points, timeRemaining, isBonusRound = false }: ScoreFeedbackProps) {
  if (!isCorrect) return null

  // Determine answer speed category
  const SUPER_FAST_THRESHOLD = 8
  const FAST_THRESHOLD = 3
  
  const isSuperFast = timeRemaining >= SUPER_FAST_THRESHOLD
  const isFast = timeRemaining >= FAST_THRESHOLD && timeRemaining < SUPER_FAST_THRESHOLD

  // Determine display properties - using design system colors (no gradients)
  let emoji = ''
  let message = ''
  let bgColor = ''
  let textColor = 'text-white'
  let badges: Array<{ icon: string; text: string; color: string }> = []

  if (isSuperFast) {
    emoji = '🚀'
    message = 'Amazing!'
    bgColor = 'bg-yellow-400'
    textColor = 'text-gray-900'
    badges.push({ icon: '⚡', text: 'Super Fast', color: 'bg-[#F97316]' })
    if (isBonusRound) {
      badges.push({ icon: '🎯', text: 'Bonus x2', color: 'bg-[#8B7FC8]' })
    }
  } else if (isFast) {
    emoji = '✨'
    message = 'Great Job!'
    bgColor = 'bg-green-400'
    textColor = 'text-white'
    badges.push({ icon: '💨', text: 'Fast Answer', color: 'bg-[#10B981]' })
    if (isBonusRound) {
      badges.push({ icon: '🎯', text: 'Bonus x2', color: 'bg-[#8B7FC8]' })
    }
  } else {
    emoji = '✓'
    message = 'Correct!'
    bgColor = 'bg-gray-300'
    textColor = 'text-gray-900'
    if (isBonusRound) {
      badges.push({ icon: '🎯', text: 'Bonus x2', color: 'bg-[#8B7FC8]' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: -50 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`${bgColor} rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl`}
      >
        {/* Emoji Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="text-7xl mb-3"
        >
          {emoji}
        </motion.div>
        
        {/* Feedback text */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl font-poppins font-bold ${textColor} mb-4`}
        >
          {message}
        </motion.h3>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-2 justify-center mb-4"
          >
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`${badge.color} text-white px-4 py-2 rounded-full text-sm font-poppins font-semibold inline-flex items-center gap-1`}
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Points */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="space-y-2"
        >
          <div className={`text-6xl font-bold ${textColor} mb-2`}>
            +{points}
          </div>

          <p className={`text-sm ${textColor} opacity-75`}>
            points earned
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}