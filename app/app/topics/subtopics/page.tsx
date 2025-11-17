import { notFound, redirect } from 'next/navigation'
import { getTopics, getSubtopics, getSubtopicAvailability } from '@/lib/strapi-server'
import SubtopicsClient from '@/components/topics/SubtopicsClient'
import type { QuizTopic, QuizSubtopic } from '@gyan-pravah/types'

interface PageProps {
  searchParams: Promise<{ topic?: string }>
}

export default async function SubtopicsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const topicSlug = params.topic
  
  if (!topicSlug) {
    redirect('/topics')
  }
  
  // Fetch data server-side
  const [allTopics, subtopics, subtopicAvailability] = await Promise.all([
    getTopics(),
    getSubtopics(topicSlug),
    getSubtopicAvailability()
  ])
  
  const selectedTopic = allTopics.find(topic => topic.slug === topicSlug)
  
  if (!selectedTopic) {
    notFound()
  }
  
  // Attach subtopics to the topic
  const topicWithSubtopics: QuizTopic = {
    ...selectedTopic,
    quiz_subtopics: subtopics
  }
  
  return (
    <SubtopicsClient 
      topic={topicWithSubtopics}
      subtopicAvailability={subtopicAvailability}
    />
  )
}