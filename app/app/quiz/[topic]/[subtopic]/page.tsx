import { notFound, redirect } from 'next/navigation'
import { getQuizQuestions, getSubtopics } from '@/lib/strapi-server'
import QuizGame from '@/components/quiz/QuizGame'

interface QuizPageProps {
  params: Promise<{
    topic: string
    subtopic: string
  }>
  searchParams: Promise<{
    mode?: 'normal' | 'expert'
  }>
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { topic, subtopic } = await params
  const { mode = 'normal' } = await searchParams
  
  // Validate that the subtopic exists and is available
  const subtopics = await getSubtopics(topic)
  const selectedSubtopic = subtopics.find(st => st.slug === subtopic)
  
  if (!selectedSubtopic || !selectedSubtopic.available) {
    notFound()
  }
  
  // Fetch questions server-side with proper caching
  const difficulty = mode === 'expert' ? 'Medium' : 'Easy'
  const questions = await getQuizQuestions(topic, subtopic, difficulty, 7)
  
  if (questions.length === 0) {
    // No questions available, redirect to topics
    redirect('/topics')
  }
  
  return (
    <QuizGame
      questions={questions}
      topicSlug={topic}
      subtopicSlug={subtopic}
      isExpertMode={mode === 'expert'}
    />
  )
}
