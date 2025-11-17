import { getTopicsWithAvailability } from '@/lib/strapi-server'
import TopicsHeader from '@/components/topics/TopicsHeader'
import TopicGrid from '@/components/topics/TopicGrid'

export default async function TopicsPage() {
  // Fetch topics server-side with caching (1 hour revalidation)
  const topics = await getTopicsWithAvailability()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
      <div className="px-4 py-8">
        <TopicsHeader />
        <TopicGrid topics={topics} />
      </div>
    </div>
  )
}