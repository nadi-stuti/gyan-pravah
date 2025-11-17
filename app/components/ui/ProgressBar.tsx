'use client'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
  showLabels?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
  current,
  total,
  className = '',
  showLabels = true,
  variant = 'default',
  size = 'md'
}: ProgressBarProps) {
  const progress = Math.min((current / total) * 100, 100)
  
  const variantClasses = {
    default: 'bg-[#8B7FC8]',
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    danger: 'bg-red-400'
  }
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  return (
    <div className={`w-full ${className}`}>
      {/* Labels */}
      {showLabels && (
        <div className={`flex justify-between items-center mb-2 font-poppins ${textSizeClasses[size]}`}>
          <span className="text-gray-600">
            Question {current} of {total}
          </span>
          <span className="text-gray-900 font-medium">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        {/* Progress bar fill */}
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${variantClasses[variant]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber <= current
          const isCurrent = stepNumber === current
          
          return (
            <div
              key={stepNumber}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isCompleted 
                  ? variantClasses[variant]
                  : isCurrent
                  ? 'bg-gray-400'
                  : 'bg-gray-200'
              } ${isCurrent ? 'scale-120' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}