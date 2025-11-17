import BackButton from '@/components/navigation/BackButton'

export default function TopicsHeader() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <BackButton to="/" />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Gyan Pravah
        </h1>
        <p className="text-white opacity-90">
          Choose a topic to start your quiz
        </p>
      </div>
    </>
  )
}
