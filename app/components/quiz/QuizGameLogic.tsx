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
    setCurrentQuestion,
    setTimeRemaining,
    setQuizMode,
    setQuizConfig,
    recordQuestionResult
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
    setIsAnswered(true)
    

    
    // Show feedback briefly before moving to next question
    setShowFeedback(true)
    
    setTimeout(() => {
      progressToNextQuestion()
    }, config.feedbackDuration)
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
      {/* Game Header with progress and score */}
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
            timeBonus={timeRemaining}
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
  timeBonus: number
}

function ScoreFeedback({ isCorrect, points, timeBonus }: ScoreFeedbackProps) {
  // Check if this is a bonus round (questions 7+)
  const isBonusQuestion = timeBonus > 0 && points > 20
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(139, 127, 200, 0.8)' }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: -50 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          p-8 rounded-3xl text-center max-w-sm mx-4 shadow-2xl
          ${isCorrect 
            ? isBonusQuestion ? 'bg-orange-500' : 'bg-green-500'
            : 'bg-red-500'
          }
        `}
      >
        {/* Emoji Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
          className="text-6xl mb-4"
        >
          {isCorrect ? '🎉' : '😔'}
        </motion.div>

        {/* Feedback text */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-poppins font-bold mb-4 text-white"
        >
          {isCorrect 
            ? isBonusQuestion ? 'BONUS!' : 'Awesome!' 
            : 'Oops!'
          }
        </motion.h3>

        {/* Points */}
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            className="space-y-2"
          >
            <div className="text-3xl font-bold text-white">
              +{points}
            </div>
            <div className="text-lg text-white opacity-90">
              {isBonusQuestion ? 'DOUBLE POINTS!' : 'points earned!'}
            </div>
            {isBonusQuestion && (
              <div className="text-sm text-white opacity-75">
                🎯 Bonus Round Reward
              </div>
            )}
          </motion.div>
        )}

        {!isCorrect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white opacity-90"
          >
            Better luck next time!
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}