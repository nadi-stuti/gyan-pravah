'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { useQuizStore } from '@/stores/useQuizStore'
import { useUserPreferences } from '@/stores/useUserPreferences'
import { useSubtopicStore } from '@/stores/useSubtopicStore'
import { strapiClient } from '@/lib/strapi'
import { LoadingAnimation } from '../animations/LottieWrapper'
import { trackEvent } from '@/lib/analytics'
import type { QuizTopic, QuizSubtopic } from '@gyan-pravah/types'

type SelectionStep = 'topic' | 'subtopic' | 'difficulty'

interface DifficultyOption {
  value: 'Easy' | 'Medium' | 'Hard'
  label: string
  description: string
}

const difficultyOptions: DifficultyOption[] = [
  {
    value: 'Easy',
    label: 'Easy',
    description: 'Perfect for beginners'
  },
  {
    value: 'Medium', 
    label: 'Medium',
    description: 'Good challenge level'
  },
  {
    value: 'Hard',
    label: 'Hard',
    description: 'Expert level difficulty'
  }
]

export default function TopicSelector() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<SelectionStep>('topic')
  const [topics, setTopics] = useState<QuizTopic[]>([])
  const [subtopics, setSubtopics] = useState<QuizSubtopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null)
  const [selectedSubtopic, setSelectedSubtopic] = useState<QuizSubtopic | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const { setQuestions, setExpertMode, setGameStatus, resetQuiz, setQuizMetadata, setQuizMode } = useQuizStore()
  const { 
    expertModeEnabled, 
    setLastPlayedTopic, 
    setLastPlayedSubtopic, 
    incrementGamesPlayed 
  } = useUserPreferences()
  const { 
    availability: subtopicAvailability, 
    setAvailability, 
    setLoading: setAvailabilityLoading,
    isStale 
  } = useSubtopicStore()

  // Load topics and subtopic availability on component mount
  useEffect(() => {
    loadTopics()
    // Only load availability if cache is stale
    if (isStale()) {
      loadSubtopicAvailability()
    }
  }, [])

  const loadSubtopicAvailability = async () => {
    try {
      setAvailabilityLoading(true)
      const availability = await strapiClient.getSubtopicAvailability()
      setAvailability(availability)
    } catch (error) {
      console.error('Failed to load subtopic availability:', error)
      setAvailabilityLoading(false)
    }
  }

  const loadTopics = async () => {
    try {
      setIsLoadingData(true)
      const topicsData = await strapiClient.getTopics()
      setTopics(topicsData)
    } catch (error) {
      console.error('Failed to load topics:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadSubtopics = async (topicSlug: string) => {
    try {
      setIsLoadingData(true)
      const subtopicsData = await strapiClient.getSubtopics({ topic: topicSlug })
      setSubtopics(subtopicsData)
    } catch (error) {
      console.error('Failed to load subtopics:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleTopicSelect = async (topic: QuizTopic) => {
    // Track topic selection
    trackEvent('topic_selected', {
      topic: topic.slug,
      topic_id: topic.id,
      subtopics_available: topic.quiz_subtopics?.length || 0
    })
    
    setSelectedTopic(topic)
    setLastPlayedTopic(topic.slug)
    await loadSubtopics(topic.slug)
    setCurrentStep('subtopic')
  }

  const handleSubtopicSelect = (subtopic: QuizSubtopic) => {
    // Check if subtopic has questions
    const hasQuestions = subtopicAvailability[subtopic.slug]?.hasQuestions
    if (!hasQuestions) {
      return // Don't allow selection of subtopics without questions
    }

    // Track subtopic selection
    trackEvent('subtopic_selected', {
      topic: selectedTopic?.slug || '',
      subtopic: subtopic.slug,
      subtopic_id: subtopic.id
    })
    
    setSelectedSubtopic(subtopic)
    setLastPlayedSubtopic(subtopic.slug)
    
    // If expert mode is enabled, skip difficulty selection
    if (expertModeEnabled) {
      startQuiz(subtopic, 'Medium') // Default to Medium for expert mode
    } else {
      setCurrentStep('difficulty')
    }
  }

  const handleDifficultySelect = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    // Track difficulty selection
    trackEvent('difficulty_selected', {
      topic: selectedTopic?.slug || '',
      subtopic: selectedSubtopic?.slug || '',
      difficulty
    })
    
    setSelectedDifficulty(difficulty)
    if (selectedSubtopic) {
      startQuiz(selectedSubtopic, difficulty)
    }
  }

  const startQuiz = async (subtopic: QuizSubtopic, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setIsLoading(true)
    
    try {
      // Reset any existing quiz state
      resetQuiz()
      
      // Set expert mode based on user preference
      setExpertMode(expertModeEnabled)
      
      // Fetch questions for selected topic, subtopic, and difficulty (QuizUp style: 7 questions)
      const questions = await strapiClient.getQuestions({
        subtopic: subtopic.slug,
        difficulty: difficulty,
        limit: 7
      })
      
      if (questions.length === 0) {
        throw new Error('No questions available for this selection')
      }
      
      // Track quiz start
      trackEvent('quiz_started', {
        mode: expertModeEnabled ? 'expert' : 'normal',
        topic: selectedTopic?.slug,
        subtopic: subtopic.slug,
        difficulty: difficulty,
        total_questions: questions.length,
        is_expert_mode: expertModeEnabled,
        is_first_visit: false,
        quiz_mode: 'quizup'
      })
      
      // Set up the quiz
      setQuestions(questions)
      setQuizMode('quizup')
      setQuizMetadata('topic', selectedTopic?.slug, subtopic.slug, difficulty)
      setGameStatus('playing')
      
      // Track game start in user preferences
      incrementGamesPlayed()
      
      // Navigate to quiz page
      router.push('/quiz')
      
    } catch (error) {
      console.error('Failed to start quiz:', error)
      
      // Track error
      trackEvent('quiz_error', {
        error_type: 'api_failure',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        context: 'topic_selector'
      })
      
      // TODO: Show error toast/notification
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 'subtopic') {
      setCurrentStep('topic')
      setSelectedTopic(null)
      setSubtopics([])
    } else if (currentStep === 'difficulty') {
      setCurrentStep('subtopic')
      setSelectedDifficulty(null)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        {['topic', 'subtopic', 'difficulty'].map((step, index) => {
          const isActive = currentStep === step
          const isCompleted = 
            (step === 'topic' && selectedTopic) ||
            (step === 'subtopic' && selectedSubtopic) ||
            (step === 'difficulty' && selectedDifficulty)
          
          return (
            <div key={step} className="flex items-center">
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive 
                    ? 'bg-primary-500 text-white' 
                    : isCompleted 
                      ? 'bg-success-500 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }
                `}
                animate={{
                  scale: isActive ? 1.1 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {isCompleted ? '✓' : index + 1}
              </motion.div>
              {index < 2 && (
                <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-success-500' : 'bg-neutral-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (isLoadingData && currentStep === 'topic') {
    return (
      <Card className="text-center py-8">
        <LoadingAnimation size="md" />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-text-secondary mt-4"
        >
          Loading topics...
        </motion.p>
      </Card>
    )
  }

  return (
    <Card>
      {renderStepIndicator()}
      
      <AnimatePresence mode="wait">
        {currentStep === 'topic' && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
              Choose a Topic
            </h3>
            
            <div className="space-y-3">
              {topics.map((topic) => {
                const totalSubtopics = topic.quiz_subtopics?.length || 0
                const availableSubtopics = topic.quiz_subtopics?.filter(subtopic => 
                  subtopicAvailability[subtopic.slug]?.hasQuestions
                ).length || 0
                
                return (
                  <motion.button
                    key={topic.id}
                    className="w-full p-3 sm:p-4 text-left bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors min-h-touch touch-manipulation"
                    onClick={() => handleTopicSelect(topic)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    role="button"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{topic.topicIcon || '📚'}</span>
                      <div>
                        <h4 className="font-medium text-text-primary">{topic.topicName}</h4>
                        <p className="text-sm text-text-secondary">
                          {availableSubtopics} of {totalSubtopics} subtopics available
                          {availableSubtopics === 0 && (
                            <span className="text-orange-600 ml-1">• Coming Soon</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {currentStep === 'subtopic' && (
          <motion.div
            key="subtopic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <h3 className="text-lg font-semibold text-text-primary">
                Choose Subtopic
              </h3>
              <div /> {/* Spacer */}
            </div>
            
            {selectedTopic && (
              <p className="text-center text-text-secondary mb-4">
                {selectedTopic.topicName}
              </p>
            )}
            
            {isLoadingData ? (
              <motion.div className="text-center py-8">
                <LoadingAnimation size="md" />
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-text-secondary mt-4"
                >
                  Loading subtopics...
                </motion.p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {subtopics.map((subtopic) => {
                  const availability = subtopicAvailability[subtopic.slug]
                  const hasQuestions = availability?.hasQuestions || false
                  const questionCount = availability?.questionCount || 0
                  
                  return (
                    <motion.button
                      key={subtopic.id}
                      className={`
                        w-full p-3 sm:p-4 text-left rounded-xl transition-colors min-h-touch touch-manipulation
                        ${hasQuestions 
                          ? 'bg-neutral-50 hover:bg-neutral-100 cursor-pointer' 
                          : 'bg-gray-100 cursor-not-allowed opacity-60'
                        }
                      `}
                      onClick={() => handleSubtopicSelect(subtopic)}
                      whileHover={hasQuestions ? { scale: 1.01 } : {}}
                      whileTap={hasQuestions ? { scale: 0.99 } : {}}
                      disabled={!hasQuestions}
                      role="button"
                      aria-disabled={!hasQuestions}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${hasQuestions ? 'text-text-primary' : 'text-gray-500'}`}>
                            {subtopic.name}
                          </h4>
                          {hasQuestions ? (
                            <p className="text-sm text-text-secondary">
                              {questionCount} questions available
                            </p>
                          ) : (
                            <p className="text-sm text-orange-600 font-medium">
                              🚧 Coming Soon
                            </p>
                          )}
                        </div>
                        {!hasQuestions && (
                          <div className="text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 00-8 0v2m0 0V9a4 4 0 018 0v2m-8 0h8" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 'difficulty' && !expertModeEnabled && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <h3 className="text-lg font-semibold text-text-primary">
                Choose Difficulty
              </h3>
              <div /> {/* Spacer */}
            </div>
            
            {selectedSubtopic && (
              <p className="text-center text-text-secondary mb-4">
                {selectedSubtopic.name}
              </p>
            )}
            
            <div className="space-y-3">
              {difficultyOptions.map((option) => (
                <motion.button
                  key={option.value}
                  className="w-full p-3 sm:p-4 text-left bg-neutral-50 hover:bg-neutral-100 rounded-xl transition-colors min-h-touch touch-manipulation"
                  onClick={() => handleDifficultySelect(option.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isLoading}
                  role="button"
                  aria-disabled={isLoading}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-text-primary">{option.label}</h4>
                      <p className="text-sm text-text-secondary">{option.description}</p>
                    </div>
                    {isLoading && selectedDifficulty === option.value && (
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}