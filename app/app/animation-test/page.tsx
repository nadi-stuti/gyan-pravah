'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { 
  SuccessAnimation, 
  FailureAnimation, 
  LoadingAnimation, 
  CelebrationAnimation 
} from '@/components/animations/LottieWrapper'
import { 
  QuizTransition, 
  SlideTransition, 
  FadeTransition 
} from '@/components/animations/PageTransition'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function AnimationTestPage() {
  const [currentAnimation, setCurrentAnimation] = useState<string>('loading')
  const [transitionKey, setTransitionKey] = useState(0)

  const animations = [
    { key: 'loading', label: 'Loading', component: <LoadingAnimation size="lg" /> },
    { key: 'success', label: 'Success', component: <SuccessAnimation size="lg" /> },
    { key: 'failure', label: 'Failure', component: <FailureAnimation size="lg" /> },
    { key: 'celebration', label: 'Celebration', component: <CelebrationAnimation size="xl" /> }
  ]

  const handleAnimationChange = (animationKey: string) => {
    setCurrentAnimation(animationKey)
    setTransitionKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-primary-500 mb-4">
            Lottie Animation Test
          </h1>
          <p className="text-text-secondary">
            Testing all Lottie animations and page transitions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Animation Display */}
          <Card className="text-center p-8">
            <h2 className="text-xl font-semibold mb-6">Current Animation</h2>
            
            <QuizTransition pageKey={`animation-${transitionKey}`}>
              <div className="flex justify-center items-center h-48">
                {animations.find(a => a.key === currentAnimation)?.component}
              </div>
            </QuizTransition>
            
            <p className="mt-4 text-text-secondary capitalize">
              {currentAnimation} Animation
            </p>
          </Card>

          {/* Animation Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Animation Controls</h2>
            
            <div className="space-y-4">
              {animations.map((animation) => (
                <Button
                  key={animation.key}
                  onClick={() => handleAnimationChange(animation.key)}
                  variant={currentAnimation === animation.key ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {animation.label}
                </Button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Page Transitions</h3>
              <div className="space-y-2">
                <FadeTransition pageKey="fade-demo">
                  <div className="p-4 bg-primary-50 rounded-lg text-center">
                    Fade Transition Demo
                  </div>
                </FadeTransition>
                
                <SlideTransition pageKey="slide-demo">
                  <div className="p-4 bg-success-50 rounded-lg text-center">
                    Slide Transition Demo
                  </div>
                </SlideTransition>
              </div>
            </div>
          </Card>
        </div>

        {/* Animation Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">✨ Implemented Features</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-success-600 mb-2">✅ Success/Failure Feedback</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Lottie animations for correct/incorrect answers</li>
                  <li>• Integrated in AnswerOptions component</li>
                  <li>• Smooth transitions with motion.dev</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-success-600 mb-2">✅ Loading Animations</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Quiz data fetching with Lottie loader</li>
                  <li>• Topic/subtopic loading states</li>
                  <li>• Specialized loading screens</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-success-600 mb-2">✅ Celebration Animations</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• High score celebration with confetti</li>
                  <li>• Integrated in ScoreDisplay component</li>
                  <li>• Particle effects for excellent performance</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-success-600 mb-2">✅ Page Transitions</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Smooth transitions between game states</li>
                  <li>• Quiz, results, and home page animations</li>
                  <li>• Multiple transition types available</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}