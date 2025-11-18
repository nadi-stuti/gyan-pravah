'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useQuizStore } from '@/stores/useQuizStore'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { ResultsLoadingScreen } from '@/components/ui/LoadingScreen'
import { trackEvent, trackQuizPerformance } from '@/lib/analytics'
import { getQuizConfig, isBonusRound } from '@/lib/quiz-config'

function ResultsContent() {
  const router = useRouter()
  const {
    questions,
    selectedAnswers,
    isExpertMode,
    resetQuiz,
    pointsPerQuestion,
    totalScore,
    questionsCorrect,
    maxPossibleScore,
    percentage,
    reactionTimes,
    averageReactionTime,
    quizSource,
    quizTopicSlug,
    quizSubtopicSlug
  } = useQuizStore()
  const {
    setExpertModeEnabled
  } = useUserPreferences()

  const [showResults, setShowResults] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [isRestarting, setIsRestarting] = useState(false)

  // Use stored values from Zustand only - no calculations needed
  const finalScore = totalScore
  const totalQuestions = questions.length

  // Detect quiz mode based on question count
  const detectQuizMode = (): 'quizup' | 'quick' | 'marathon' | 'first-visit' => {
    if (totalQuestions === 3) return 'first-visit'
    if (totalQuestions === 5) return 'quick'
    if (totalQuestions === 15) return 'marathon'
    return 'quizup' // Default 7 questions
  }

  const quizMode = detectQuizMode()
  const config = getQuizConfig(quizMode)

  useEffect(() => {
    // Track results viewed (page view tracking handled by ClientLayout)

    trackEvent('results_viewed', {
      final_score: finalScore,
      percentage,
      questions_correct: questionsCorrect,
      total_questions: totalQuestions
    })

    // Track quiz performance metrics
    trackQuizPerformance(finalScore, maxPossibleScore, questionsCorrect, totalQuestions, 0)

    // Show score animation first, then results
    const timer = setTimeout(() => {
      setShowResults(true)
    }, 2000) // 2 seconds for score animation

    return () => clearTimeout(timer)
  }, [finalScore, questions, selectedAnswers, percentage, totalQuestions, maxPossibleScore])

  // Handle replay with same settings - navigate to appropriate quiz route
  const handleReplaySame = () => {
    if (isRestarting) return
    
    setIsRestarting(true)
    
    trackEvent('replay_same_clicked', {
      previous_score: finalScore,
      previous_percentage: percentage,
      mode: isExpertMode ? 'expert' : 'normal'
    })

    // Navigate based on quiz source
    // Questions will be fetched server-side
    const mode = isExpertMode ? 'expert' : 'normal'
    
    if (quizSource === 'random' || quizSource === 'first-visit') {
      // Random quiz - navigate to random quiz route
      const quizMode = quizSource === 'first-visit' ? 'first-visit' : mode
      router.push(`/quiz/random?mode=${quizMode}`)
    } else if (quizSource === 'topic' && quizTopicSlug && quizSubtopicSlug) {
      // Topic-based quiz - navigate to topic quiz route
      router.push(`/quiz/${quizTopicSlug}/${quizSubtopicSlug}?mode=${mode}`)
    } else {
      // Fallback to home
      router.push('/')
    }
  }

  // Handle replay with expert mode toggle - navigate with toggled mode
  const handleReplayExpert = () => {
    if (isRestarting) return
    
    setIsRestarting(true)
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

    // Update user preference
    setExpertModeEnabled(newExpertMode)

    // Navigate based on quiz source with toggled mode
    // Questions will be fetched server-side
    const mode = newExpertMode ? 'expert' : 'normal'
    
    if (quizSource === 'random' || quizSource === 'first-visit') {
      // Random quiz - navigate to random quiz route
      router.push(`/quiz/random?mode=${mode}`)
    } else if (quizSource === 'topic' && quizTopicSlug && quizSubtopicSlug) {
      // Topic-based quiz - navigate to topic quiz route
      router.push(`/quiz/${quizTopicSlug}/${quizSubtopicSlug}?mode=${mode}`)
    } else {
      // Fallback to home
      router.push('/')
    }
  }

  // Handle choose topic
  const handleChooseTopic = () => {
    trackEvent('choose_topic_clicked', {
      final_score: finalScore,
      percentage,
      context: 'results_page'
    })

    resetQuiz()
    router.push('/topics')
  }

  // Handle go to home
  const handleGoHome = () => {
    trackEvent('go_home_clicked', {
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
    <div className="min-h-screen p-3 sm:p-4" style={{ backgroundColor: '#8B7FC8' }}>
      <div className="max-w-2xl mx-auto">
        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-4 sm:mb-6 text-center shadow-xl"
        >
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
              {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : percentage >= 40 ? '👍' : '💪'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
            <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">{finalScore}</div>
            <div className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">out of {maxPossibleScore} points</div>

            {/* Average Reaction Time */}
            {averageReactionTime > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Average Reaction Time</div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {averageReactionTime.toFixed(1)}s
                </div>
                <div className="text-xs text-gray-500">
                  {averageReactionTime < 3 ? '🔥 Lightning Fast!' : 
                   averageReactionTime < 5 ? '🌡️ Great Speed' :
                   averageReactionTime < 7 ? '❄️ Good Pace' : '🧊 Take Your Time'}
                </div>
              </div>
            )}

            <div className="text-xl sm:text-2xl font-semibold text-gray-800">{percentage}% Correct</div>
            <div className="text-sm sm:text-base text-gray-600">{questionsCorrect} out of {totalQuestions} questions</div>
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

        {/* Performance Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-center shadow-lg"
        >
          <div className="text-lg sm:text-xl font-poppins font-semibold text-gray-900">
            {percentage >= 80 && "🎉 Excellent work! You're a quiz master!"}
            {percentage >= 60 && percentage < 80 && "👏 Great job! Keep it up!"}
            {percentage >= 40 && percentage < 60 && "👍 Good effort! Practice makes perfect!"}
            {percentage < 40 && "💪 Keep learning! You'll get better with practice!"}
          </div>
        </motion.div>

        {/* Action Buttons - Single Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          // className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
          className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-center shadow-lg"
        >
          {/* <button
            onClick={handleReplaySame}
            disabled={isRestarting}
            className="bg-green-400 hover:bg-green-500 text-white font-bold py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            role="button"
            title="Play Again"
          >
            <span className="block sm:hidden">{isRestarting ? '⏳' : '🔄'}</span>
            <span className="hidden sm:block">{isRestarting ? '⏳ Loading...' : '🔄 Play Again'}</span>
          </button>

          <button
            onClick={handleReplayExpert}
            disabled={isRestarting}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            role="button"
            title={isExpertMode ? 'Switch to Normal Mode' : 'Switch to Expert Mode'}
          >
            <span className="block sm:hidden">{isRestarting ? '⏳' : '⚡'}</span>
            <span className="hidden sm:block">{isRestarting ? '⏳ Loading...' : `⚡ ${isExpertMode ? 'Normal' : 'Expert'}`}</span>
          </button>

          <button
            onClick={handleChooseTopic}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 shadow-lg text-sm sm:text-base"
            role="button"
            title="Choose Topic"
          >
            <span className="block sm:hidden">📖</span>
            <span className="hidden sm:block">📖 Topics</span>
          </button> */}

          <button
            onClick={handleGoHome}
            // className="bg-white hover:bg-gray-50 text-gray-900 font-bold py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 shadow-lg border-2 border-gray-200 text-sm sm:text-base"
            className="text-lg sm:text-xl font-poppins font-semibold text-gray-900"
            role="button"
            title="Play Again"
          >
            {/* <span className="block sm:hidden">🏠</span>
            <span className="hidden sm:block">🏠 Home</span> */}
            🔄️Play Again
          </button>
        </motion.div>

        {/* Quiz Summary Pill - Single Line */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 sm:mt-6 bg-white rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 text-center">Question Summary</h3>
            
            {/* Single-line horizontal pill */}
            <div className="w-full overflow-x-auto py-2">
              <div className="flex gap-2 flex-nowrap min-w-max justify-center">
                {questions.map((question, index) => {
                  const userAnswer = selectedAnswers[index] as 'A' | 'B' | 'C' | 'D' | undefined
                  const isCorrect = userAnswer === question.correctOption
                  const reactionTimes = useQuizStore.getState().reactionTimes
                  const reactionTime = reactionTimes[index] || 0
                  const timeRemaining = 10 - reactionTime
                  
                  // Determine status
                  let status: { color: string; icon: string; label: string; textColor: string }
                  
                  if (!userAnswer) {
                    status = { 
                      color: 'bg-gray-600', 
                      icon: '⊘', 
                      label: 'Skipped',
                      textColor: 'text-white'
                    }
                  } else if (!isCorrect) {
                    status = { 
                      color: 'bg-red-400', 
                      icon: '❌', 
                      label: 'Wrong',
                      textColor: 'text-white'
                    }
                  } else if (timeRemaining >= 8) {
                    status = { 
                      color: 'bg-yellow-400', 
                      icon: '🔥', 
                      label: 'Super Fast',
                      textColor: 'text-gray-900'
                    }
                  } else if (timeRemaining >= 3) {
                    status = { 
                      color: 'bg-green-400', 
                      icon: '✨', 
                      label: 'Fast',
                      textColor: 'text-white'
                    }
                  } else {
                    status = { 
                      color: 'bg-gray-400', 
                      icon: '⏱️', 
                      label: 'Late',
                      textColor: 'text-white'
                    }
                  }

                  return (
                    <div
                      key={question.id}
                      className={`${status.color} ${status.textColor} px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-1 shadow-sm`}
                      title={`Q${index + 1}: ${status.label}`}
                    >
                      <span>{status.icon}</span>
                      <span>{index + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <span>🔥</span>
                <span className="text-gray-700">Super Fast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✨</span>
                <span className="text-gray-700">Fast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>⏱️</span>
                <span className="text-gray-700">Late</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>❌</span>
                <span className="text-gray-700">Wrong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>⊘</span>
                <span className="text-gray-700">Skipped</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Paginated Review Cards */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">Review Your Answers</h3>
            
            {/* Question Counter */}
            <div className="text-center text-white mb-4 text-sm">
              Question {currentReviewIndex + 1} of {questions.length}
            </div>
            
            {/* Single Question Card */}
            {(() => {
              const index = currentReviewIndex
              const question = questions[index]
              const userAnswer = selectedAnswers[index] as 'A' | 'B' | 'C' | 'D' | undefined
              const isCorrect = userAnswer === question.correctOption
              const isBonus = isBonusRound(index, config)
              const maxQuestionPoints = isBonus ? config.maxPointsPerBonusQuestion : config.maxPointsPerNormalQuestion
              const earnedPoints = pointsPerQuestion[index] || 0
              const reactionTime = reactionTimes[index] || 0
              const timeRemaining = 10 - reactionTime

              return (
                <motion.div
                  key={`review-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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

                  {/* Scoring Breakdown */}
                  {isCorrect ? (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Scoring Breakdown</h4>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Remaining:</span>
                          <span className="font-semibold">{timeRemaining.toFixed(1)}s</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-semibold">
                            {timeRemaining >= 8 ? '🔥 Super Fast' : 
                             timeRemaining >= 3 ? '✨ Fast' : '⏱️ Late'}
                          </span>
                        </div>
                        
                        <div className="border-t pt-2 mt-2 space-y-1">
                          {timeRemaining >= 8 && (
                            <>
                              <div className="flex justify-between text-gray-700">
                                <span>Base Points:</span>
                                <span>+10</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Fast Bonus:</span>
                                <span>+5</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Super Fast Bonus:</span>
                                <span>+5</span>
                              </div>
                            </>
                          )}
                          
                          {timeRemaining >= 3 && timeRemaining < 8 && (
                            <>
                              <div className="flex justify-between text-gray-700">
                                <span>Base Points:</span>
                                <span>+10</span>
                              </div>
                              <div className="flex justify-between text-gray-700">
                                <span>Speed Bonus ({Math.floor(timeRemaining - 3)}s):</span>
                                <span>+{Math.floor(timeRemaining - 3)}</span>
                              </div>
                            </>
                          )}
                          
                          {timeRemaining < 3 && (
                            <div className="flex justify-between text-gray-700">
                              <span>Late Answer:</span>
                              <span>+5</span>
                            </div>
                          )}
                          
                          {isBonus && (
                            <div className="flex justify-between text-purple-600 font-semibold">
                              <span>Bonus Round Multiplier:</span>
                              <span>×2</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                          <span>Total Points:</span>
                          <span className="text-purple-600">+{earnedPoints}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Scoring Breakdown</h4>
                      <div className="text-gray-600">
                        ❌ Incorrect answer: 0 points
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 gap-4">
              <button
                onClick={() => setCurrentReviewIndex(prev => Math.max(0, prev - 1))}
                disabled={currentReviewIndex === 0}
                className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50 shadow-lg"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentReviewIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentReviewIndex === questions.length - 1}
                className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50 shadow-lg"
              >
                Next →
              </button>
            </div>
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