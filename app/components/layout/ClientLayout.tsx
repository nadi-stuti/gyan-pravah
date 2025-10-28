'use client'

import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { ReactNode, useEffect } from 'react'
import { trackPageView } from '@/lib/analytics'
import NavigationHandler from '@/components/navigation/NavigationHandler'

interface ClientLayoutProps {
  children: ReactNode
}

// Extremely subtle page transition variants
const getPageVariants = (pathname: string, previousPath?: string) => {
  // Determine navigation direction
  const routeOrder = ['/', '/topics', '/topics/subtopics', '/quiz', '/results']
  const currentIndex = routeOrder.findIndex(route => pathname.startsWith(route))
  const previousIndex = previousPath ? routeOrder.findIndex(route => previousPath.startsWith(route)) : -1
  
  const isBackward = currentIndex < previousIndex && previousIndex !== -1

  // Barely noticeable fade with minimal movement
  if (isBackward) {
    return {
      initial: { opacity: 0.8, x: -3 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0.8, x: 3 }
    }
  }

  return {
    initial: { opacity: 0.8, x: 3 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0.8, x: -3 }
  }
}

const pageTransition = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.15
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  // Track page views globally (but avoid duplicate tracking)
  useEffect(() => {
    // Extract page name from pathname for analytics
    const pageName = pathname === '/' ? 'home' : pathname.slice(1).split('/')[0]
    
    // Only track if it's a main page transition
    const validPages = ['home', 'quiz', 'results', 'topics', 'subtopics'] as const
    type ValidPage = typeof validPages[number]
    
    if (validPages.includes(pageName as ValidPage)) {
      trackPageView(pageName as ValidPage)
    }
  }, [pathname])

  // Get appropriate variants for current route
  const pageVariants = getPageVariants(pathname)

  return (
    <>
      <NavigationHandler />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-screen w-full"
          style={{ 
            position: 'relative',
            zIndex: 1
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}