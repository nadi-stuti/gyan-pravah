/**
 * Mobile-optimized animation configurations
 */

import { Transition, Variants } from 'motion/react'
import { isMobileDevice, getOptimalAnimationDuration } from './mobile-gestures'

/**
 * Base animation configurations optimized for mobile performance
 */
export const mobileAnimationConfig = {
  // Reduced spring stiffness for smoother mobile animations
  spring: {
    type: "spring" as const,
    stiffness: isMobileDevice() ? 250 : 400,
    damping: isMobileDevice() ? 30 : 25,
  },
  
  // Faster transitions for mobile
  fast: {
    duration: getOptimalAnimationDuration(0.2),
    ease: "easeOut" as const,
  },
  
  // Standard transitions
  standard: {
    duration: getOptimalAnimationDuration(0.3),
    ease: "easeInOut" as const,
  },
  
  // Slower transitions for important animations
  slow: {
    duration: getOptimalAnimationDuration(0.5),
    ease: "easeInOut" as const,
  },
}

/**
 * Mobile-optimized page transition variants
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    x: isMobileDevice() ? 10 : 20, // Reduced movement on mobile
    scale: isMobileDevice() ? 0.98 : 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: mobileAnimationConfig.standard,
  },
  exit: {
    opacity: 0,
    x: isMobileDevice() ? -10 : -20,
    scale: isMobileDevice() ? 0.98 : 0.95,
    transition: mobileAnimationConfig.fast,
  },
}

/**
 * Mobile-optimized card animation variants
 */
export const cardAnimationVariants: Variants = {
  initial: {
    opacity: 0,
    y: isMobileDevice() ? 15 : 30,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: mobileAnimationConfig.spring,
  },
  exit: {
    opacity: 0,
    y: isMobileDevice() ? -15 : -30,
    scale: 0.95,
    transition: mobileAnimationConfig.fast,
  },
  hover: isMobileDevice() ? {} : {
    scale: 1.02,
    transition: mobileAnimationConfig.fast,
  },
  tap: {
    scale: isMobileDevice() ? 0.98 : 0.95,
    transition: mobileAnimationConfig.fast,
  },
}

/**
 * Mobile-optimized button animation variants
 */
export const buttonAnimationVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: mobileAnimationConfig.spring,
  },
  hover: isMobileDevice() ? {} : {
    scale: 1.05,
    transition: mobileAnimationConfig.fast,
  },
  tap: {
    scale: 0.95,
    transition: mobileAnimationConfig.fast,
  },
}

/**
 * Mobile-optimized question card animation variants
 */
export const questionCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: isMobileDevice() ? 0.95 : 0.9,
    y: isMobileDevice() ? 20 : 40,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...mobileAnimationConfig.spring,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: isMobileDevice() ? 0.95 : 0.9,
    y: isMobileDevice() ? -20 : -40,
    transition: mobileAnimationConfig.fast,
  },
}

/**
 * Mobile-optimized answer option animation variants
 */
export const answerOptionVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...mobileAnimationConfig.fast,
      delay: index * 0.05, // Reduced delay on mobile
    },
  }),
  hover: isMobileDevice() ? {} : {
    scale: 1.02,
    transition: mobileAnimationConfig.fast,
  },
  tap: {
    scale: 0.98,
    transition: mobileAnimationConfig.fast,
  },
}

/**
 * Mobile-optimized loading animation variants
 */
export const loadingVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

/**
 * Mobile-optimized stagger animation configuration
 */
export const staggerConfig = {
  animate: {
    transition: {
      staggerChildren: isMobileDevice() ? 0.05 : 0.1,
      delayChildren: isMobileDevice() ? 0.1 : 0.2,
    },
  },
}

/**
 * Get mobile-optimized transition based on animation type
 */
export const getMobileTransition = (type: 'fast' | 'standard' | 'slow' | 'spring'): Transition => {
  return mobileAnimationConfig[type] || mobileAnimationConfig.standard
}

/**
 * Reduced motion configuration for accessibility
 */
export const reducedMotionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get animation variants with reduced motion support
 */
export const getAccessibleVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return reducedMotionConfig
  }
  
  return variants
}