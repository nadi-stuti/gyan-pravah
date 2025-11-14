'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { QuizQuestion } from '@gyan-pravah/types'
import { useQuizStore } from '../../stores/useQuizStore'
import QuestionCard from './QuestionCard'
import GameHeader from './GameHeader'
import { SuccessAnimation, FailureAnimation, LoadingAnimation } from '../animations/LottieWrapper'
import { trackEvent } from '@/lib/analytics'
import { 
  getQuizConfig, 
  calculateQuestionPoints, 
  calculateMaxScore, 
  isBonusRound, 
  getQuestionTypeLabel,
  calculateQuizStats,
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
    averageReactionTime,
    setCurrentQuestion,
    setTimeRemaining,
    setQuizMode,
    setQuizConfig,
    recordQuestionResult,
    recordReactionTime
  } = useQuizStore()

  const [isAnswered, setIsAnswered] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizStartTime] = useState(Date.now())

  // Set quiz mode and config in store when component mounts
  useEffect(() => {
    setQuizMode(quizMode)
    const maxScore = calculateMaxScore(config)
    setQuizConfig(maxScore)
  }, [quizMode, setQuizMode, setQuizConfig, config])

  // State to track if reading period is active
  const [isReadingPeriod, setIsReadingPeriod] = useState(true)

  // Reset reading period when question changes
  useEffect(() => {
    setIsReadingPeriod(true)
    // Reading period ends after 3 seconds
    const readingTimer = setTimeout(() => {
      setIsReadingPeriod(false)
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

  // Auto-progress when timer reaches 0 (but not during reading period)
  useEffect(() => {
    if (timeRemaining === 0 && !isAnswered && !isReadingPeriod) {
      handleTimeUp()
    }
  }, [timeRemaining, isAnswered, isReadingPeriod])

  // Calculate points using QuizUp system
  const calculatePoints = useCallback((remainingTime: number, questionIndex: number): number => {
    const isBonus = isBonusRound(questionIndex, config)
    return calculateQuestionPoints(true, remainingTime, isBonus, config)
  }, [config])

  // Handle answer selection
  const handleAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || isReadingPeriod) return

    const currentQ = questions[currentQuestion]
    const isCorrect = answer === currentQ.correctOption
    const points = isCorrect ? calculatePoints(timeRemaining, currentQuestion) : 0
    const timeTaken = config.questionTimeLimit - timeRemaining
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
    
    // Record the complete question result in store
    recordQuestionResult(currentQuestion, answer, points, isCorrect)
    
    // Record reaction time
    recordReactionTime(timeTaken)
    
    setIsAnswered(true)
    
    // For wrong answers, don't show popup - show correct answer on card
    // For correct answers, show popup feedback
    if (isCorrect) {
      setShowFeedback(true)
    }
    
    setTimeout(() => {
      progressToNextQuestion()
    }, 2500) // 2.5 seconds for both correct and wrong answers
  }, [
    isAnswered, 
    isReadingPeriod,
    questions, 
    currentQuestion, 
    timeRemaining, 
    calculatePoints, 
    recordQuestionResult,
    config
  ])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (isAnswered || isReadingPeriod) return
    
    const currentQ = questions[currentQuestion]
    
    // Track question timeout
    trackEvent('question_timeout', {
      question_id: currentQ.id,
      question_number: currentQuestion + 1,
      correct_answer: currentQ.correctOption,
      difficulty: currentQ.difficulty,
      topic: currentQ.quiz_subtopic?.quiz_topic?.slug || 'unknown',
      subtopic: currentQ.quiz_subtopic?.slug
    })
    
    // No answer selected, mark as unanswered and move on
    // Record 0 points for skipped question
    recordQuestionResult(currentQuestion, '', 0, false)
    setIsAnswered(true)
    setShowFeedback(true)
    
    setTimeout(() => {
      progressToNextQuestion()
    }, 1000) // Shorter delay for timeout
  }, [isAnswered, isReadingPeriod, questions, currentQuestion, recordQuestionResult])

  // Progress to next question or complete quiz
  const progressToNextQuestion = useCallback(() => {
    const nextQuestionIndex = currentQuestion + 1
    
    if (nextQuestionIndex >= questions.length) {
      // Quiz complete - all data is already stored in Zustand
      // Track quiz completion using stored data
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
      
      // Quiz complete - use stored total score
      onQuizComplete(totalScore, selectedAnswers)
      return
    }
    
    // Move to next question
    setCurrentQuestion(nextQuestionIndex)
    setTimeRemaining(config.questionTimeLimit) // Reset timer based on config
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingAnimation size="lg" />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-text-secondary font-poppins"
        >
          Loading question...
        </motion.p>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Game Header with progress, score, and reaction time */}
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

      {/* Score feedback overlay */}
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

// Score Feedback Component
interface ScoreFeedbackProps {
  isCorrect: boolean
  points: number
  timeRemaining: number
  isBonusRound?: boolean
}

function ScoreFeedback({ isCorrect, points, timeRemaining, isBonusRound = false }: ScoreFeedbackProps) {
  if (!isCorrect) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-50 px-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-red-500 rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="text-7xl mb-3"
          >
            😔
          </motion.div>
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-poppins font-bold text-white mb-2"
          >
            Oops!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white opacity-90"
          >
            Better luck next time
          </motion.p>
        </motion.div>
      </motion.div>
    )
  }

  // Determine answer speed category
  const SUPER_FAST_THRESHOLD = 8
  const FAST_THRESHOLD = 3
  
  const isSuperFast = timeRemaining >= SUPER_FAST_THRESHOLD
  const isFast = timeRemaining >= FAST_THRESHOLD && timeRemaining < SUPER_FAST_THRESHOLD
  const isLate = timeRemaining < FAST_THRESHOLD

  // Determine display properties
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
    badges.push({ icon: '⚡', text: 'Super Fast', color: 'bg-orange-500' })
    if (isBonusRound) {
      badges.push({ icon: '🎯', text: 'Bonus x2', color: 'bg-purple-600' })
    }
  } else if (isFast) {
    emoji = '✨'
    message = 'Great Job!'
    bgColor = 'bg-green-500'
    textColor = 'text-white'
    badges.push({ icon: '💨', text: 'Fast Answer', color: 'bg-green-600' })
    if (isBonusRound) {
      badges.push({ icon: '🎯', text: 'Bonus x2', color: 'bg-purple-600' })
    }
  } else {
    emoji = '✓'
    message = 'Correct!'
    bgColor = 'bg-gray-500'
    textColor = 'text-white'
    if (isBonusRound) {
      badges.push({ icon: '🎯', text: 'Bonus x2', color: 'bg-purple-600' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${bgColor} rounded-3xl p-8 text-center max-w-sm w-full`}
      >
        {/* Emoji - Subtle entrance */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="text-7xl mb-3"
        >
          {emoji}
        </motion.div>

        {/* Message */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-3xl font-poppins font-bold ${textColor} mb-4`}
        >
          {message}
        </motion.h3>

        {/* Badges - Pill style */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 justify-center mb-4"
          >
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.1), type: "spring", stiffness: 300, damping: 20 }}
                className={`${badge.color} text-white px-4 py-2 rounded-full text-sm font-poppins font-semibold inline-flex items-center gap-1`}
              >
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Points - Large and clear */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
          className={`text-6xl font-bold ${textColor} mb-2`}
        >
          +{points}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-sm ${textColor} opacity-75`}
        >
          points earned
        </motion.p>
      </motion.div>
    </motion.div>
  )
}