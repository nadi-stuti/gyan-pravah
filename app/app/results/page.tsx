'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useQuizStore } from '@/stores/useQuizStore'
import { useUserPreferences } from '@/stores/useUserPreferences'

import { ResultsLoadingScreen } from '@/components/ui/LoadingScreen'
import { FadeTransition } from '@/components/animations/PageTransition'
import { trackEvent, trackPageView, trackQuizPerformance } from '@/lib/analytics'
import { getQuizConfig, isBonusRound } from '@/lib/quiz-config'

function ResultsContent() {
  const router = useRouter()
  const {
    questions,
    selectedAnswers,
    isExpertMode,
    resetQuiz,
    setExpertMode,
    pointsPerQuestion,
    totalScore,
    questionsCorrect,
    maxPossibleScore,
    percentage,
    quizMode: storedQuizMode
  } = useQuizStore()
  const {
    setExpertModeEnabled,
    incrementGamesPlayed,
    setBestScore
  } = useUserPreferences()

  const [showResults, setShowResults] = useState(false)

  // Use stored values from Zustand only - no calculations needed
  const finalScore = totalScore
  const totalQuestions = questions.length

  // Use stored quiz mode or detect as fallback
  const detectQuizMode = (): 'quizup' | 'quick' | 'marathon' | 'first-visit' => {
    if (totalQuestions === 3) return 'first-visit'
    if (totalQuestions === 5) return 'quick'
    if (totalQuestions === 15) return 'marathon'
    return 'quizup' // Default 7 questions
  }

  const quizMode = storedQuizMode || detectQuizMode()
  const config = getQuizConfig(quizMode)

  useEffect(() => {
    // Track page view
    trackPageView('results')

    // Track results viewed (use stored values)

    trackEvent('results_viewed', {
      final_score: finalScore,
      percentage,
      questions_correct: questionsCorrect,
      total_questions: totalQuestions
    })

    // Track quiz performance metrics
    trackQuizPerformance(finalScore, maxPossibleScore, questionsCorrect, totalQuestions, 0)

    // Update user preferences when results load
    incrementGamesPlayed()
    setBestScore(finalScore)

    // Show score animation first, then results
    const timer = setTimeout(() => {
      setShowResults(true)
    }, 2000) // 2 seconds for score animation

    return () => clearTimeout(timer)
  }, [finalScore, incrementGamesPlayed, setBestScore, questions, selectedAnswers, percentage, totalQuestions, maxPossibleScore])

  // Handle replay with same settings
  const handleReplaySame = () => {
    trackEvent('replay_same_clicked', {
      previous_score: finalScore,
      previous_percentage: percentage,
      mode: isExpertMode ? 'expert' : 'normal'
    })

    resetQuiz()
    router.push('/quiz')
  }

  // Handle replay with expert mode toggle
  const handleReplayExpert = () => {
    const newExpertMode = !isExpertMode

    trackEvent('expert_mode_toggled', {
      enabled: newExpertMode,
      context: 'results_page'
    })

    trackEvent('replay_expert_toggled', {
      previous_mode: isExpertMode ? 'expert' : 'normal',
      new_mode: newExpertMode ? 'expert' : 'normal',
      previous_score: finalScore
    })

    setExpertMode(newExpertMode)
    setExpertModeEnabled(newExpertMode)
    resetQuiz()
    router.push('/quiz')
  }

  // Handle return to home
  const handleReturnHome = () => {
    trackEvent('return_home_clicked', {
      final_score: finalScore,
      percentage,
      context: 'results_page'
    })

    resetQuiz()
    router.push('/')
  }

  // Handle redirect if no quiz data
  useEffect(() => {
    if (questions.length === 0) {
      router.push('/')
    }
  }, [questions.length, router])

  if (questions.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#8B7FC8' }}>
      <div className="max-w-2xl mx-auto">
        {/* Score Display */}
        <FadeTransition pageKey="score-display">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-3xl p-8 mb-6 text-center shadow-xl"
          >
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : percentage >= 40 ? '👍' : '💪'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
            <div className="text-5xl font-bold text-purple-600 mb-2">{finalScore}</div>
            <div className="text-lg text-gray-600 mb-4">out of {maxPossibleScore} points</div>

            <div className="text-2xl font-semibold text-gray-800">{percentage}% Correct</div>
            <div className="text-gray-600">{questionsCorrect} out of {totalQuestions} questions</div>
            {(() => {
              // Calculate actual bonus questions from the quiz questions
              const actualBonusQuestions = questions.filter((_, index) => isBonusRound(index, config)).length
              const actualBonusCorrect = questions.filter((question, index) => {
                const userAnswer = selectedAnswers[index]
                return isBonusRound(index, config) && userAnswer === question.correctOption
              }).length

              return actualBonusQuestions > 0 && (
                <div className="text-sm text-orange-600 mt-2">
                  🎯 Bonus Questions: {actualBonusCorrect}/{actualBonusQuestions} correct
                </div>
              )
            })()}
          </motion.div>
        </FadeTransition>

        {/* Performance Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 mb-6 text-center shadow-lg"
        >
          <div className="text-xl font-poppins font-semibold text-gray-900">
            {percentage >= 80 && "🎉 Excellent work! You're a quiz master!"}
            {percentage >= 60 && percentage < 80 && "👏 Great job! Keep it up!"}
            {percentage >= 40 && percentage < 60 && "👍 Good effort! Practice makes perfect!"}
            {percentage < 40 && "💪 Keep learning! You'll get better with practice!"}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <button
            onClick={handleReplaySame}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔄 Play Again
          </button>

          <button
            onClick={handleReplayExpert}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            ⚡ {isExpertMode ? 'Try Normal Mode' : 'Try Expert Mode'}
          </button>

          <button
            onClick={handleReturnHome}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-gray-200"
          >
            🏠 Choose New Topic
          </button>
        </motion.div>

        {/* Circle Progress Summary */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Question Summary</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index] as 'A' | 'B' | 'C' | 'D' | undefined
                const isCorrect = userAnswer === question.correctOption

                return (
                  <div
                    key={question.id}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                      ${isCorrect ? 'bg-green-500' : userAnswer ? 'bg-red-500' : 'bg-gray-400'}
                    `}
                  >
                    {index + 1}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Incorrect</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span>Skipped</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Detailed Results Cards */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 space-y-4"
          >
            <h3 className="text-xl font-bold text-white mb-6 text-center">Review Your Answers</h3>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index] as 'A' | 'B' | 'C' | 'D' | undefined
              const isCorrect = userAnswer === question.correctOption
              const isBonus = isBonusRound(index, config)
              const maxQuestionPoints = isBonus ? config.maxPointsPerBonusQuestion : config.maxPointsPerNormalQuestion

              // Use actual stored points for this question
              const earnedPoints = pointsPerQuestion[index] || 0

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                        ${isCorrect ? 'bg-green-500' : userAnswer ? 'bg-red-500' : 'bg-gray-400'}
                      `}>
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-semibold">Correct</span>
                          </div>
                        ) : userAnswer ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-sm font-semibold">Incorrect</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold">Skipped</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{earnedPoints}/{maxQuestionPoints}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {question.question}
                    </p>
                  </div>

                  {/* Answers */}
                  <div className="space-y-3 mb-4">
                    {userAnswer && (
                      <div className={`
                        flex items-center gap-3 p-3 rounded-lg border-2
                        ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                      `}>
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold
                          ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
                        `}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Your answer:</div>
                          <div className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {question.options[userAnswer]}
                          </div>
                        </div>
                      </div>
                    )}

                    {!isCorrect && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border-2 bg-green-50 border-green-200">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold bg-green-500">
                          ✓
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Correct answer:</div>
                          <div className="font-medium text-green-800">
                            {question.options[question.correctOption]}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">Explanation:</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {question.explanation || 'No explanation available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <ResultsLoadingScreen />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}