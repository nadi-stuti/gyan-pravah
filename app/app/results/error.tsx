'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#8B7FC8]">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Results Error
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'Failed to load results. Please try again.'}
          </p>
          <button
            onClick={reset}
            className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#6B5FA8] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
