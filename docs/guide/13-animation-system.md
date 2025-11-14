# Animation System

## 🎭 Animation Overview

The Gyan Pravah animation system provides smooth, performant, and accessible animations using Motion (Framer Motion) and Lottie React. The system is optimized for mobile devices with careful attention to performance, battery life, and user preferences.

## 🏗️ Animation Architecture

```
Animation System Components:
├── LottieWrapper.tsx          # Lottie animation wrapper
├── PageTransition.tsx         # Page transition effects
├── mobile-animations.ts       # Mobile-optimized variants
├── mobile-gestures.ts         # Touch gesture handling
└── Component animations       # Individual component animations
```

## 🎨 Motion Animation System

### Mobile-Optimized Animation Variants

The animation system provides mobile-first animation configurations that adapt to device capabilities.

```typescript
// Mobile animation configuration
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
  }
}
```

### Core Animation Variants

**Page Transitions:**
```typescript
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
```

**Card Animations:**
```typescript
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
  hover: isMobileDevice() ? {} : {
    scale: 1.02,
    transition: mobileAnimationConfig.fast,
  },
  tap: {
    scale: isMobileDevice() ? 0.98 : 0.95,
    transition: mobileAnimationConfig.fast,
  },
}
```

**Button Animations:**
```typescript
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
```

### Accessibility Integration

```typescript
// Reduced motion configuration for accessibility
export const reducedMotionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
}

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get animation variants with reduced motion support
export const getAccessibleVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return reducedMotionConfig
  }
  return variants
}
```

## 🎬 Lottie Animation System

### LottieWrapper Component

The LottieWrapper provides a robust interface for loading and displaying Lottie animations.

```typescript
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

  // Load animation data asynchronously
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

  // Handle loading state
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

  // Handle error state
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
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  )
}
```

### Predefined Animation Components

```typescript
// Success animation for correct answers
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

// Failure animation for incorrect answers
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

// Loading animation for data fetching
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

// Celebration animation for quiz completion
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
```

## 🔄 Page Transition System

### PageTransition Component

```typescript
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
  )
}
```

### Specialized Transition Components

```typescript
// Quiz-specific transitions with scale effect
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

// Horizontal slide transitions
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

// Simple fade transitions
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
```

## 📱 Mobile Animation Optimizations

### Performance Considerations

```typescript
// Get optimal animation duration based on device performance
export const getOptimalAnimationDuration = (baseDuration: number): number => {
  if (typeof window === 'undefined') return baseDuration
  
  // Reduce animation duration on mobile for better performance
  if (isMobileDevice()) {
    return baseDuration * 0.7
  }
  
  return baseDuration
}

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768
  )
}
```

### GPU-Accelerated Animations

```typescript
// Use transform properties for GPU acceleration
const gpuAcceleratedVariants = {
  initial: { 
    opacity: 0, 
    transform: 'translateY(20px) scale(0.95)' // GPU-accelerated
  },
  animate: { 
    opacity: 1, 
    transform: 'translateY(0px) scale(1)' 
  }
}

// Avoid layout-triggering properties
// ❌ Bad - causes layout recalculation
const badVariants = {
  animate: { height: 'auto', width: '100%' }
}

// ✅ Good - GPU-accelerated
const goodVariants = {
  animate: { scaleY: 1, scaleX: 1 }
}
```

### Touch-Responsive Animations

```typescript
// Different animations for touch vs mouse
const touchResponsiveVariants = {
  hover: isMobileDevice() ? {} : {
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: isMobileDevice() ? 0.98 : 0.95,
    transition: { duration: 0.1 }
  }
}
```

## 🎯 Animation Usage Patterns

### Component Animation Integration

```typescript
// Standard component animation pattern
const AnimatedComponent = ({ children, ...props }) => {
  return (
    <motion.div
      variants={getAccessibleVariants(cardAnimationVariants)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {children}
    </motion.div>
  )
}
```

### List Animation Patterns

```typescript
// Staggered list animations
const AnimatedList = ({ items }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: isMobileDevice() ? 0.05 : 0.1,
            delayChildren: 0.1
          }
        }
      }}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <ItemComponent item={item} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### Conditional Animations

```typescript
// Animate based on state
const ConditionalAnimation = ({ isActive, children }) => {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.05 : 1,
        opacity: isActive ? 1 : 0.7
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
```

## 🎮 Quiz-Specific Animations

### Question Transition Animations

```typescript
// Question card entrance animation
const questionCardVariants = {
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
```

### Answer Feedback Animations

```typescript
// Answer option feedback
const answerFeedbackVariants = {
  correct: {
    scale: [1, 1.1, 1],
    backgroundColor: ['#ffffff', '#4ade80', '#4ade80'],
    transition: { duration: 0.5 }
  },
  incorrect: {
    x: [0, -10, 10, -10, 0],
    backgroundColor: ['#ffffff', '#f87171', '#f87171'],
    transition: { duration: 0.5 }
  }
}
```

### Score Animation

```typescript
// Animated score counter
const AnimatedScore = ({ score, duration = 1000 }) => {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const startScore = displayScore

    const updateScore = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const currentScore = Math.floor(
        startScore + (score - startScore) * progress
      )
      
      setDisplayScore(currentScore)

      if (progress < 1) {
        requestAnimationFrame(updateScore)
      }
    }

    requestAnimationFrame(updateScore)
  }, [score, duration])

  return (
    <motion.div
      key={score}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="text-4xl font-bold"
    >
      {displayScore}
    </motion.div>
  )
}
```

## 🔧 Animation Performance

### Performance Monitoring

```typescript
// Monitor animation performance
const monitorAnimationPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'measure' && entry.name.includes('animation')) {
        console.log(`Animation ${entry.name}: ${entry.duration}ms`)
        
        // Track slow animations
        if (entry.duration > 16) { // Slower than 60fps
          trackEvent('slow_animation', {
            animation_name: entry.name,
            duration: entry.duration,
            device_type: isMobileDevice() ? 'mobile' : 'desktop'
          })
        }
      }
    })
  })

  observer.observe({ entryTypes: ['measure'] })
}
```

### Memory Management

```typescript
// Clean up animations on unmount
useEffect(() => {
  const controls = animate(element, { x: 100 })
  
  return () => {
    controls.stop() // Stop animation
    controls.complete() // Clean up
  }
}, [])
```

### Battery Optimization

```typescript
// Reduce animations on low battery
const useBatteryOptimization = () => {
  const [isLowBattery, setIsLowBattery] = useState(false)

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatteryStatus = () => {
          setIsLowBattery(battery.level < 0.2 && !battery.charging)
        }

        battery.addEventListener('levelchange', updateBatteryStatus)
        battery.addEventListener('chargingchange', updateBatteryStatus)
        updateBatteryStatus()
      })
    }
  }, [])

  return isLowBattery
}

// Use in components
const AnimatedComponent = () => {
  const isLowBattery = useBatteryOptimization()
  
  const variants = isLowBattery ? reducedMotionConfig : fullAnimationVariants
  
  return (
    <motion.div variants={variants}>
      Content
    </motion.div>
  )
}
```

## 🧪 Testing Animations

### Animation Testing

```typescript
describe('Animation System', () => {
  it('respects reduced motion preferences', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => ({
        matches: true, // User prefers reduced motion
        addListener: jest.fn(),
        removeListener: jest.fn()
      }))
    })

    const variants = getAccessibleVariants(cardAnimationVariants)
    
    expect(variants).toEqual(reducedMotionConfig)
  })

  it('loads Lottie animations correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ mockAnimationData: true })
      })
    )

    render(<LoadingAnimation />)
    
    await waitFor(() => {
      expect(screen.queryByText('Animation unavailable')).not.toBeInTheDocument()
    })
  })

  it('handles animation errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))

    render(<LoadingAnimation />)
    
    await waitFor(() => {
      expect(screen.getByText('Animation unavailable')).toBeInTheDocument()
    })
  })
})
```

The animation system provides a comprehensive, performant, and accessible foundation for creating engaging user experiences while maintaining excellent performance on mobile devices and respecting user preferences.