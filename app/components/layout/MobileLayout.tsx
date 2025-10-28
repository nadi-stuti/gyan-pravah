'use client'

import { ReactNode, useEffect } from 'react'
import { motion } from 'motion/react'
import { getSafeAreaInsets, optimizeScrollForMobile, preventZoomOnDoubleTap } from '@/lib/mobile-gestures'

interface MobileLayoutProps {
  children: ReactNode
  className?: string
  enableSafeArea?: boolean
  preventZoom?: boolean
  optimizeScroll?: boolean
}

export default function MobileLayout({
  children,
  className = '',
  enableSafeArea = true,
  preventZoom = true,
  optimizeScroll = true
}: MobileLayoutProps) {
  useEffect(() => {
    const container = document.getElementById('mobile-layout-container')
    
    if (container) {
      // Prevent zoom on double tap if enabled
      if (preventZoom) {
        preventZoomOnDoubleTap(container)
      }
      
      // Optimize scroll behavior if enabled
      if (optimizeScroll) {
        optimizeScrollForMobile(container)
      }
    }
  }, [preventZoom, optimizeScroll])

  const safeAreaInsets = enableSafeArea ? getSafeAreaInsets() : { top: 0, bottom: 0, left: 0, right: 0 }
  
  const layoutStyle = enableSafeArea ? {
    paddingTop: `max(1rem, ${safeAreaInsets.top}px)`,
    paddingBottom: `max(1rem, ${safeAreaInsets.bottom}px)`,
    paddingLeft: `max(0.75rem, ${safeAreaInsets.left}px)`,
    paddingRight: `max(0.75rem, ${safeAreaInsets.right}px)`,
  } : {}

  return (
    <motion.div
      id="mobile-layout-container"
      className={`min-h-screen w-full ${className}`}
      style={layoutStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}