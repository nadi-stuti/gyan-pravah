import { create } from 'zustand'
import type { QuizQuestion } from '@gyan-pravah/types'

// Quiz Store - Essential game state only
interface QuizState {
  // Game flow
  currentQuestion: number
  selectedAnswers: Record<number, string>
  timeRemaining: number
  isExpertMode: boolean
  gameStatus: 'idle' | 'playing' | 'completed'
  questions: QuizQuestion[]
  
  // Quiz metadata for replay
  quizSource: 'random' | 'topic' | 'first-visit' | null
  quizTopicSlug: string | null
  quizSubtopicSlug: string | null
  
  // Results data
  pointsPerQuestion: Record<number, number>
  totalScore: number
  questionsCorrect: number
  questionsAnswered: number
  maxPossibleScore: number
  percentage: number
  reactionTimes: number[]
  averageReactionTime: number
  
  // Actions
  setCurrentQuestion: (questionIndex: number) => void
  setSelectedAnswer: (questionIndex: number, answer: string) => void
  setTimeRemaining: (time: number) => void
  setExpertMode: (enabled: boolean) => void
  setGameStatus: (status: 'idle' | 'playing' | 'completed') => void
  setQuestions: (questions: QuizQuestion[]) => void
  setQuizConfig: (maxScore: number) => void
  setQuizMetadata: (source: 'random' | 'topic' | 'first-visit', topicSlug?: string, subtopicSlug?: string) => void
  recordQuestionResult: (questionIndex: number, answer: string, points: number, isCorrect: boolean) => void
  recordReactionTime: (time: number) => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  currentQuestion: 0,
  selectedAnswers: {},
  timeRemaining: 20,
  isExpertMode: false,
  gameStatus: 'idle',
  questions: [],
  
  // Quiz metadata
  quizSource: null,
  quizTopicSlug: null,
  quizSubtopicSlug: null,
  
  // Results data
  pointsPerQuestion: {},
  totalScore: 0,
  questionsCorrect: 0,
  questionsAnswered: 0,
  maxPossibleScore: 0,
  percentage: 0,
  reactionTimes: [],
  averageReactionTime: 0,
  
  // Actions
  setCurrentQuestion: (questionIndex) => set({ currentQuestion: questionIndex }),
  
  setSelectedAnswer: (questionIndex, answer) => 
    set((state) => ({
      selectedAnswers: { ...state.selectedAnswers, [questionIndex]: answer }
    })),
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setExpertMode: (enabled) => set({ isExpertMode: enabled }),
  setGameStatus: (status) => set({ gameStatus: status }),
  setQuestions: (questions) => set({ questions }),
  setQuizConfig: (maxScore) => set({ maxPossibleScore: maxScore }),
  
  setQuizMetadata: (source, topicSlug, subtopicSlug) => set({
    quizSource: source,
    quizTopicSlug: topicSlug || null,
    quizSubtopicSlug: subtopicSlug || null
  }),
  
  // Record question result - this is the key method that stores everything
  recordQuestionResult: (questionIndex, answer, points, isCorrect) => {
    const state = get()
    const newPointsPerQuestion = { ...state.pointsPerQuestion, [questionIndex]: points }
    const newSelectedAnswers = { ...state.selectedAnswers, [questionIndex]: answer }
    const newTotalScore = state.totalScore + points
    const newQuestionsAnswered = state.questionsAnswered + 1
    const newQuestionsCorrect = state.questionsCorrect + (isCorrect ? 1 : 0)
    const newPercentage = state.questions.length > 0 ? Math.round((newQuestionsCorrect / state.questions.length) * 100) : 0
    
    set({
      selectedAnswers: newSelectedAnswers,
      pointsPerQuestion: newPointsPerQuestion,
      totalScore: newTotalScore,
      questionsAnswered: newQuestionsAnswered,
      questionsCorrect: newQuestionsCorrect,
      percentage: newPercentage
    })
  },
  
  // Record reaction time for each question
  recordReactionTime: (time) => {
    const state = get()
    const newReactionTimes = [...state.reactionTimes, time]
    const average = newReactionTimes.reduce((sum, t) => sum + t, 0) / newReactionTimes.length
    
    set({
      reactionTimes: newReactionTimes,
      averageReactionTime: average
    })
  },
  
  resetQuiz: () => set({
    currentQuestion: 0,
    selectedAnswers: {},
    timeRemaining: 20,
    gameStatus: 'idle',
    questions: [],
    quizSource: null,
    quizTopicSlug: null,
    quizSubtopicSlug: null,
    pointsPerQuestion: {},
    totalScore: 0,
    questionsCorrect: 0,
    questionsAnswered: 0,
    maxPossibleScore: 0,
    percentage: 0,
    reactionTimes: [],
    averageReactionTime: 0,
  }),
}))