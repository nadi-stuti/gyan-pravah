'use client'

import { motion, AnimatePresence } from 'motion/react'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  pageKey: string
  direction?: 'horizontal' | 'vertical' | 'scale' | 'fade'
  duration?: number
  className?: string
}

const transitionVariants = {
  horizontal: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
  },
  vertical: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
}

export default function PageTransition({
  children,
  pageKey,
  direction = 'horizontal',
  duration = 0.3,
  className = ''
}: PageTransitionProps) {
  const variants = transitionVariants[direction]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration,
          ease: "easeInOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Specialized transition components
export function QuizTransition({ 
  children, 
  pageKey, 
  className = '' 
}: Omit<PageTransitionProps, 'direction' | 'duration'>) {
  return (
    <PageTransition
      pageKey={pageKey}
      direction="scale"
      duration={0.4}
      className={className}
    >
      {children}
    </PageTransition>
  )
}

export function SlideTransition({ 
  children, 
  pageKey, 
  className = '' 
}: Omit<PageTransitionProps, 'direction' | 'duration'>) {
  return (
    <PageTransition
      pageKey={pageKey}
      direction="horizontal"
      duration={0.3}
      className={className}
    >
      {children}
    </PageTransition>
  )
}

export function FadeTransition({ 
  children, 
  pageKey, 
  className = '' 
}: Omit<PageTransitionProps, 'direction' | 'duration'>) {
  return (
    <PageTransition
      pageKey={pageKey}
      direction="fade"
      duration={0.2}
      className={className}
    >
      {children}
    </PageTransition>
  )
}