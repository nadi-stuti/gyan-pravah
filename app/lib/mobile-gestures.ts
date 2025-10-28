/**
 * Mobile gesture handling utilities for touch-friendly interactions
 */

import { PanInfo } from 'motion/react'

export interface SwipeGestureConfig {
  threshold?: number
  velocity?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

/**
 * Handle swipe gestures with configurable thresholds
 */
export const handleSwipeGesture = (
  event: MouseEvent | TouchEvent | PointerEvent,
  info: PanInfo,
  config: SwipeGestureConfig
) => {
  const { threshold = 50, velocity = 500 } = config
  const { offset, velocity: gestureVelocity } = info

  // Check if gesture meets minimum requirements
  const isSignificantGesture = 
    Math.abs(offset.x) > threshold || 
    Math.abs(offset.y) > threshold ||
    Math.abs(gestureVelocity.x) > velocity ||
    Math.abs(gestureVelocity.y) > velocity

  if (!isSignificantGesture) return

  // Determine primary direction
  const isHorizontal = Math.abs(offset.x) > Math.abs(offset.y)
  
  if (isHorizontal) {
    if (offset.x > 0 && config.onSwipeRight) {
      config.onSwipeRight()
    } else if (offset.x < 0 && config.onSwipeLeft) {
      config.onSwipeLeft()
    }
  } else {
    if (offset.y > 0 && config.onSwipeDown) {
      config.onSwipeDown()
    } else if (offset.y < 0 && config.onSwipeUp) {
      config.onSwipeUp()
    }
  }
}

/**
 * Check if device is mobile based on touch capability and screen size
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768
  )
}

/**
 * Get optimal animation duration based on device performance
 */
export const getOptimalAnimationDuration = (baseDuration: number): number => {
  if (typeof window === 'undefined') return baseDuration
  
  // Reduce animation duration on mobile for better performance
  if (isMobileDevice()) {
    return baseDuration * 0.7
  }
  
  return baseDuration
}

/**
 * Touch-friendly button press handler with haptic feedback
 */
export const handleTouchPress = (callback: () => void) => {
  // Provide haptic feedback if available
  if ('vibrate' in navigator) {
    navigator.vibrate(10) // Very short vibration
  }
  
  callback()
}

/**
 * Prevent zoom on double tap for specific elements
 */
export const preventZoomOnDoubleTap = (element: HTMLElement) => {
  let lastTouchEnd = 0
  
  element.addEventListener('touchend', (event) => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })
}

/**
 * Safe area insets for devices with notches/rounded corners
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
  }
}

/**
 * Optimize scroll behavior for mobile
 */
export const optimizeScrollForMobile = (element: HTMLElement) => {
  // Enable momentum scrolling on iOS
  ;(element.style as any).webkitOverflowScrolling = 'touch'
  
  // Prevent overscroll bounce
  element.style.overscrollBehavior = 'contain'
}