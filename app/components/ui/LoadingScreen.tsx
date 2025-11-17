'use client'

interface LoadingScreenProps {
  message?: string
  submessage?: string
  className?: string
}

export default function LoadingScreen({
  message = "Loading...",
  submessage,
  className = ''
}: LoadingScreenProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8 text-center ${className}`}>
      {/* Simple spinner */}
      <div className="w-16 h-16 border-4 border-[#8B7FC8] border-t-transparent rounded-full animate-spin" />
      
      {/* Main message */}
      <div className="space-y-2">
        <h2 className="text-xl font-poppins font-semibold text-gray-900">
          {message}
        </h2>
        
        {submessage && (
          <p className="text-gray-600 font-poppins">
            {submessage}
          </p>
        )}
      </div>

      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#8B7FC8] rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// Specialized loading screens
export function QuizLoadingScreen() {
  return (
    <LoadingScreen
      message="Preparing your quiz"
      submessage="Fetching questions and setting up the game..."
    />
  )
}

export function DataLoadingScreen() {
  return (
    <LoadingScreen
      message="Loading data"
      submessage="Please wait while we fetch the latest content..."
    />
  )
}

export function ResultsLoadingScreen() {
  return (
    <LoadingScreen
      message="Calculating results"
      submessage="Analyzing your performance..."
    />
  )
}