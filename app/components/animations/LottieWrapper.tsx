'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { motion } from 'motion/react'

interface LottieWrapperProps {
  animationPath: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loop?: boolean
  autoplay?: boolean
  speed?: number
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

const sizeMap = {
  sm: { width: 60, height: 60 },
  md: { width: 100, height: 100 },
  lg: { width: 150, height: 150 },
  xl: { width: 200, height: 200 }
}

export default function LottieWrapper({
  animationPath,
  size = 'md',
  loop = false,
  autoplay = true,
  speed = 1,
  onComplete,
  className = '',
  style = {}
}: LottieWrapperProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const [animationData, setAnimationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load animation data
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(animationPath)
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.statusText}`)
        }
        
        const data = await response.json()
        setAnimationData(data)
      } catch (err) {
        console.error('Error loading Lottie animation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load animation')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimation()
  }, [animationPath])

  // Set animation speed
  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed)
    }
  }, [speed, animationData])

  // Handle animation complete
  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }

  const dimensions = sizeMap[size]

  if (isLoading) {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={`flex items-center justify-center ${className}`}
        style={{ ...dimensions, ...style }}
      >
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </motion.div>
    )
  }

  if (error || !animationData) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ ...dimensions, ...style }}
      >
        <span className="text-xs text-gray-500">Animation unavailable</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{ ...dimensions, ...style }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={handleComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  )
}

// Predefined animation components for common use cases
export function SuccessAnimation({ 
  size = 'md', 
  onComplete, 
  className = '' 
}: Omit<LottieWrapperProps, 'animationPath'>) {
  return (
    <LottieWrapper
      animationPath="/animations/success.json"
      size={size}
      loop={false}
      autoplay={true}
      onComplete={onComplete}
      className={className}
    />
  )
}

export function FailureAnimation({ 
  size = 'md', 
  onComplete, 
  className = '' 
}: Omit<LottieWrapperProps, 'animationPath'>) {
  return (
    <LottieWrapper
      animationPath="/animations/failure.json"
      size={size}
      loop={false}
      autoplay={true}
      onComplete={onComplete}
      className={className}
    />
  )
}

export function LoadingAnimation({ 
  size = 'md', 
  className = '' 
}: Omit<LottieWrapperProps, 'animationPath' | 'loop' | 'autoplay'>) {
  return (
    <LottieWrapper
      animationPath="/animations/loading.json"
      size={size}
      loop={true}
      autoplay={true}
      className={className}
    />
  )
}

export function CelebrationAnimation({ 
  size = 'xl', 
  onComplete, 
  className = '' 
}: Omit<LottieWrapperProps, 'animationPath'>) {
  return (
    <LottieWrapper
      animationPath="/animations/celebration.json"
      size={size}
      loop={false}
      autoplay={true}
      onComplete={onComplete}
      className={className}
    />
  )
}