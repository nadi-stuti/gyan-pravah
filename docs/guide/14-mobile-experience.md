# Mobile Experience

## 📱 Mobile-First Overview

**Note:** As of v2.3, the mobile experience has been simplified to focus on reliable, straightforward interactions. Complex swipe gestures and wrapper components have been removed in favor of clear, touch-optimized buttons and simple animations.

The Gyan Pravah application is designed with a mobile-first approach, ensuring optimal performance, usability, and accessibility on mobile devices through simple, reliable patterns.

## 🎯 Mobile Design Principles

### Touch-First Design

**Minimum Touch Target Sizes:**
```typescript
// Touch target size system
const touchTargetSizes = {
  small: 'min-h-touch',      // 44px minimum (iOS guideline)
  medium: 'min-h-touch-lg',  // 48px minimum (Android guideline)
  large: 'min-h-touch-xl'    // 52px minimum (comfortable)
}

// Applied in components
<button className="min-h-touch-lg w-full p-4 rounded-xl">
  Touch-Friendly Button
</button>
```

**Touch Optimization:**
```typescript
// Touch manipulation CSS property
.touch-element {
  touch-action: manipulation; /* Removes 300ms tap delay */
}

// Prevent zoom on double tap
.no-zoom {
  touch-action: pan-x pan-y;
}
```

### Responsive Typography

```typescript
// Mobile-first typography scale
const typographyScale = {
  // Mobile (default)
  'text-sm': '14px',    // Body text
  'text-base': '16px',  // Primary text
  'text-lg': '18px',    // Headings
  'text-xl': '20px',    // Large headings
  
  // Small screens (640px+)
  'sm:text-base': '16px',
  'sm:text-lg': '18px',
  'sm:text-xl': '20px',
  'sm:text-2xl': '24px',
  
  // Medium screens (768px+)
  'md:text-lg': '18px',
  'md:text-xl': '20px',
  'md:text-2xl': '24px',
  'md:text-3xl': '30px'
}
```

### Spacing System

```typescript
// Mobile-optimized spacing
const spacingSystem = {
  // Compact spacing for mobile
  mobile: {
    padding: 'p-3',      // 12px
    margin: 'm-3',       // 12px
    gap: 'gap-3'         // 12px
  },
  
  // Comfortable spacing for larger screens
  desktop: {
    padding: 'sm:p-4 md:p-6',    // 16px → 24px
    margin: 'sm:m-4 md:m-6',     // 16px → 24px
    gap: 'sm:gap-4 md:gap-6'     // 16px → 24px
  }
}
```

## 🤏 Touch Gesture System

### Gesture Handling

```typescript
// Mobile gesture utilities
export interface SwipeGestureConfig {
  threshold?: number
  velocity?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

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
```

### Touch Press Optimization

```typescript
// Enhanced touch press handling
export const handleTouchPress = (callback: () => void) => {
  // Provide haptic feedback if available
  if ('vibrate' in navigator) {
    navigator.vibrate(10) // Very short vibration
  }
  
  // Execute callback
  callback()
}

// Usage in components
<button onClick={() => handleTouchPress(handleClick)}>
  Touch-Optimized Button
</button>
```

### Touch-Optimized Quiz Interface

```typescript
// Simple touch-optimized question cards
const QuestionCard = ({ question, onAnswer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="touch-manipulation"
    >
      <QuestionContent question={question} />
      <AnswerOptions onAnswer={onAnswer} />
    </motion.div>
  )
}
```

**Note:** Complex swipe gestures have been removed in favor of simple, reliable touch interactions. The focus is on clear, responsive buttons rather than gesture-based navigation.

## 📐 Safe Area Handling

### Safe Area Implementation

```typescript
// Safe area inset utilities
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
```

### MobileLayout Component

```typescript
export default function MobileLayout({
  children,
  enableSafeArea = true,
  preventZoom = true,
  optimizeScroll = true
}: MobileLayoutProps) {
  const safeAreaInsets = enableSafeArea ? getSafeAreaInsets() : { top: 0, bottom: 0, left: 0, right: 0 }
  
  const layoutStyle = enableSafeArea ? {
    paddingTop: `max(1rem, ${safeAreaInsets.top}px)`,
    paddingBottom: `max(1rem, ${safeAreaInsets.bottom}px)`,
    paddingLeft: `max(0.75rem, ${safeAreaInsets.left}px)`,
    paddingRight: `max(0.75rem, ${safeAreaInsets.right}px)`,
  } : {}

  useEffect(() => {
    const container = document.getElementById('mobile-layout-container')
    
    if (container) {
      if (preventZoom) {
        preventZoomOnDoubleTap(container)
      }
      
      if (optimizeScroll) {
        optimizeScrollForMobile(container)
      }
    }
  }, [preventZoom, optimizeScroll])

  return (
    <motion.div
      id="mobile-layout-container"
      className="min-h-screen w-full"
      style={layoutStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  )
}
```

### CSS Safe Area Integration

```css
/* CSS custom properties for safe areas */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}

/* Tailwind utilities for safe areas */
.safe-top { 
  padding-top: max(1rem, var(--safe-area-inset-top)); 
}

.safe-bottom { 
  padding-bottom: max(1rem, var(--safe-area-inset-bottom)); 
}

.safe-left { 
  padding-left: max(0.75rem, var(--safe-area-inset-left)); 
}

.safe-right { 
  padding-right: max(0.75rem, var(--safe-area-inset-right)); 
}
```

## 🎨 Mobile-Optimized Animations

### Performance-First Animations

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
  }
}

// Get optimal animation duration based on device
export const getOptimalAnimationDuration = (baseDuration: number): number => {
  if (typeof window === 'undefined') return baseDuration
  
  // Reduce animation duration on mobile for better performance
  if (isMobileDevice()) {
    return baseDuration * 0.7
  }
  
  return baseDuration
}
```

### GPU-Accelerated Transforms

```typescript
// Use transform properties for better performance
const mobileOptimizedVariants = {
  initial: { 
    opacity: 0, 
    transform: 'translateY(20px) scale(0.95)' // GPU-accelerated
  },
  animate: { 
    opacity: 1, 
    transform: 'translateY(0px) scale(1)' 
  }
}

// Avoid layout-triggering properties on mobile
// ❌ Bad - causes layout recalculation
const badMobileVariants = {
  animate: { height: 'auto', width: '100%' }
}

// ✅ Good - GPU-accelerated
const goodMobileVariants = {
  animate: { scaleY: 1, scaleX: 1 }
}
```

### Touch-Responsive Animations

```typescript
// Different animations for touch vs hover
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

## 📊 Mobile Performance Optimization

### Device Detection

```typescript
// Comprehensive mobile device detection
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.innerWidth <= 768 ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}

// Detect specific mobile features
export const getMobileCapabilities = () => {
  return {
    hasTouch: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hasVibration: 'vibrate' in navigator,
    hasDeviceMotion: 'DeviceMotionEvent' in window,
    hasDeviceOrientation: 'DeviceOrientationEvent' in window,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches
  }
}
```

### Memory Management

```typescript
// Mobile memory optimization
const useMobileMemoryOptimization = () => {
  const [isLowMemory, setIsLowMemory] = useState(false)

  useEffect(() => {
    // Monitor memory usage on mobile
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = performance.memory
        const usedMB = memInfo.usedJSHeapSize / 1048576
        const limitMB = memInfo.jsHeapSizeLimit / 1048576
        
        // Consider low memory if using > 80% of limit
        setIsLowMemory(usedMB / limitMB > 0.8)
      }

      const interval = setInterval(checkMemory, 10000) // Check every 10s
      return () => clearInterval(interval)
    }
  }, [])

  return isLowMemory
}

// Use in components to reduce features on low memory
const MobileOptimizedComponent = () => {
  const isLowMemory = useMobileMemoryOptimization()
  
  return (
    <div>
      {isLowMemory ? (
        <SimpleComponent />
      ) : (
        <FullFeaturedComponent />
      )}
    </div>
  )
}
```

### Battery Optimization

```typescript
// Battery-aware optimizations
const useBatteryOptimization = () => {
  const [batteryInfo, setBatteryInfo] = useState({
    level: 1,
    charging: true,
    isLowBattery: false
  })

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatteryInfo = () => {
          setBatteryInfo({
            level: battery.level,
            charging: battery.charging,
            isLowBattery: battery.level < 0.2 && !battery.charging
          })
        }

        battery.addEventListener('levelchange', updateBatteryInfo)
        battery.addEventListener('chargingchange', updateBatteryInfo)
        updateBatteryInfo()
      })
    }
  }, [])

  return batteryInfo
}

// Reduce animations and features on low battery
const BatteryAwareComponent = () => {
  const { isLowBattery } = useBatteryOptimization()
  
  const animationConfig = isLowBattery 
    ? { duration: 0.1, ease: "linear" }
    : { duration: 0.3, ease: "easeOut" }
  
  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={animationConfig}
    >
      Content
    </motion.div>
  )
}
```

## 🔄 Mobile Scroll Optimization

### Scroll Behavior Enhancement

```typescript
// Optimize scroll behavior for mobile
export const optimizeScrollForMobile = (element: HTMLElement) => {
  // Enable momentum scrolling on iOS
  ;(element.style as any).webkitOverflowScrolling = 'touch'
  
  // Prevent overscroll bounce
  element.style.overscrollBehavior = 'contain'
  
  // Smooth scrolling
  element.style.scrollBehavior = 'smooth'
}

// Prevent zoom on double tap
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
```

### Virtual Scrolling for Performance

```typescript
// Virtual scrolling for large lists on mobile
import { FixedSizeList as List } from 'react-window'

const MobileVirtualList = ({ items }: { items: any[] }) => {
  const itemHeight = 80 // Fixed height for performance
  const containerHeight = Math.min(window.innerHeight * 0.7, 600)

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <MobileListItem item={items[index]} />
    </div>
  )

  return (
    <List
      height={containerHeight}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {Row}
    </List>
  )
}
```

## 📱 PWA Features

### Service Worker Integration

```typescript
// PWA configuration for mobile
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/your-api\.com\/api\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
        }
      }
    }
  ]
})
```

### App Manifest

```json
{
  "name": "Gyan Pravah Quiz",
  "short_name": "Gyan Pravah",
  "description": "Interactive quiz application for Indian cultural knowledge",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#8B7FC8",
  "theme_color": "#8B7FC8",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

## 🧪 Mobile Testing

### Mobile Testing Utilities

```typescript
// Mobile testing helpers
export const mockMobileEnvironment = () => {
  // Mock touch events
  Object.defineProperty(window, 'ontouchstart', {
    value: () => {},
    writable: true
  })

  // Mock mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    value: 375,
    writable: true
  })

  Object.defineProperty(window, 'innerHeight', {
    value: 667,
    writable: true
  })

  // Mock mobile user agent
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    writable: true
  })

  // Mock touch points
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 5,
    writable: true
  })
}

// Test mobile interactions
describe('Mobile Experience', () => {
  beforeEach(() => {
    mockMobileEnvironment()
  })

  it('detects mobile device correctly', () => {
    expect(isMobileDevice()).toBe(true)
  })

  it('applies mobile-optimized animations', () => {
    const duration = getOptimalAnimationDuration(0.3)
    expect(duration).toBe(0.21) // 30% reduction for mobile
  })

  it('handles touch gestures', () => {
    const onSwipeLeft = jest.fn()
    const mockInfo = {
      offset: { x: -100, y: 0 },
      velocity: { x: -600, y: 0 }
    }

    handleSwipeGesture(null, mockInfo, { onSwipeLeft })
    expect(onSwipeLeft).toHaveBeenCalled()
  })
})
```

### Performance Testing

```typescript
// Mobile performance monitoring
const monitorMobilePerformance = () => {
  // Monitor frame rate
  let frameCount = 0
  let lastTime = performance.now()

  const measureFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      
      if (fps < 30) {
        console.warn(`Low FPS detected: ${fps}`)
        trackEvent('performance_warning', {
          metric: 'fps',
          value: fps,
          device_type: 'mobile'
        })
      }
      
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(measureFPS)
  }

  requestAnimationFrame(measureFPS)
}

// Monitor touch responsiveness
const monitorTouchResponsiveness = () => {
  let touchStartTime = 0

  document.addEventListener('touchstart', () => {
    touchStartTime = performance.now()
  })

  document.addEventListener('touchend', () => {
    const responseTime = performance.now() - touchStartTime
    
    if (responseTime > 100) {
      trackEvent('slow_touch_response', {
        response_time: responseTime,
        device_type: 'mobile'
      })
    }
  })
}
```

## 📋 Mobile UX Best Practices

### Touch Target Guidelines

```typescript
// Touch target size recommendations
const touchTargetGuidelines = {
  minimum: '44px',      // iOS minimum
  recommended: '48px',  // Android recommendation
  comfortable: '52px',  // Comfortable for all users
  
  // Spacing between targets
  minimumSpacing: '8px',
  recommendedSpacing: '12px'
}

// Implementation
<div className="space-y-3"> {/* 12px spacing */}
  <button className="min-h-touch-lg w-full"> {/* 48px minimum */}
    Primary Action
  </button>
  <button className="min-h-touch-lg w-full">
    Secondary Action
  </button>
</div>
```

### Mobile Navigation Patterns

```typescript
// Bottom navigation for mobile
const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            className="flex flex-col items-center p-2 min-h-touch"
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
```

### Mobile Form Optimization

```typescript
// Mobile-optimized form inputs
const MobileFormInput = ({ type, label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        className="
          w-full min-h-touch-lg px-4 py-3 
          text-base rounded-xl border border-gray-300
          focus:ring-2 focus:ring-primary-500 focus:border-transparent
        "
        // Mobile-specific attributes
        autoComplete={type === 'email' ? 'email' : undefined}
        inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined}
        {...props}
      />
    </div>
  )
}
```

The mobile experience system ensures that Gyan Pravah provides an exceptional user experience on mobile devices through careful attention to touch interactions, performance optimization, and mobile-specific design patterns.