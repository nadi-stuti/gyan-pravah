import { redirect } from 'next/navigation'
import { getRandomQuestions } from '@/lib/strapi-server'
import QuizGame from '@/components/quiz/QuizGame'

interface RandomQuizPageProps {
  searchParams: Promise<{
    mode?: 'normal' | 'expert' | 'first-visit'
  }>
}

export default async function RandomQuizPage({ searchParams }: RandomQuizPageProps) {
  const { mode = 'normal' } = await searchParams
  
  // Fetch random questions server-side with proper caching
  const questions = await getRandomQuestions(7, mode)
  
  if (questions.length === 0) {
    // No questions available, redirect to home
    redirect('/')
  }
  
  return (
    <QuizGame
      questions={questions}
      topicSlug=""
      subtopicSlug=""
      isExpertMode={mode === 'expert'}
      isRandomQuiz
    />
  )
}
