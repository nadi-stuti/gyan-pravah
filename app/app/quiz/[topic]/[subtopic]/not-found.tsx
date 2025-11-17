import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8B7FC8' }}>
      <div className="text-center text-white px-4">
        <h2 className="text-3xl font-bold mb-4">Quiz Not Found</h2>
        <p className="mb-6 opacity-90">
          The quiz you're looking for doesn't exist or is not available.
        </p>
        <Link
          href="/topics"
          className="inline-block bg-white text-[#8B7FC8] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Back to Topics
        </Link>
      </div>
    </div>
  )
}
