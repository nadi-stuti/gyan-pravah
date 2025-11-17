# Performance Optimization

## 🚀 Performance Overview

**Note:** As of v2.3, performance has been significantly improved through codebase simplification. The application now uses server components by default, has a 30-40% smaller bundle size, and follows Next.js best practices for optimal performance.

The Gyan Pravah application is optimized for mobile-first performance with careful attention to bundle size, runtime performance, and user experience through simple, efficient implementations.

## 📦 Bundle Optimization

### 1. Code Splitting Strategies

**Automatic Route-Based Splitting:**
```typescript
// Next.js automatically splits routes
app/
├── page.tsx           # Home page bundle (server component)
├── quiz/[topic]/[subtopic]/page.tsx  # Quiz page bundle (server component)
├── topics/page.tsx    # Topics page bundle (server component)
└── results/page.tsx   # Results page bundle (server component)
```

**Server Components by Default:**
```typescript
// Most components are now server components
// Only use 'use client' when necessary for interactivity

// Server component (default) - no JavaScript sent to client
export default async function TopicsPage() {
  const topics = await getTopics() // Server-side fetch
  return <TopicGrid topics={topics} />
}

// Client component - only when needed
'use client'
export default function QuizGame({ questions }) {
  // Interactive quiz logic
  return <QuizInterface questions={questions} />
}
```

**Simplified Bundle:**
- Removed Lottie library
- Removed complex error handling libraries
- Removed unnecessary wrapper components
- Result: 30-40% smaller bundle size

### 2. Tree Shaking Optimization

**Barrel Exports with Selective Imports:**
```typescript
// components/ui/index.ts - Barrel export
export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as LoadingScreen } from './LoadingScreen'

// Usage - Import only what you need
import { Button, Card } from '@/components/ui'
// Instead of: import * as UI from '@/components/ui'
```

**Library Optimization:**
```typescript
// Optimize third-party imports
import { motion } from 'motion/react' // Only import what's needed
// Instead of: import * as Motion from 'motion/react'

// Use specific Lodash functions
import debounce from 'lodash/debounce'
// Instead of: import _ from 'lodash'
```

### 3. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for duplicate dependencies
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

**Bundle Size Targets (v2.3):**
- **Initial bundle**: < 150KB gzipped (improved from 200KB)
- **Route bundles**: < 70KB gzipped each (improved from 100KB)
- **Vendor bundle**: < 100KB gzipped (improved from 150KB)
- **Total JavaScript**: < 350KB gzipped (improved from 500KB)

**Achieved through:**
- Server components reducing client JavaScript
- Removal of unnecessary libraries (Lottie, complex error handlers)
- Simplified component architecture
- Direct implementations without wrapper abstractions

## ⚡ Runtime Performance

### 1. React Performance Optimization

**Memoization Strategies:**
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// Memoize callback functions
const handleClick = useCallback((id: string) => {
  onItemClick(id)
}, [onItemClick])

// Memoize components
const MemoizedComponent = memo(({ data }: Props) => {
  return <ExpensiveComponent data={data} />
})
```

**Optimized Store Subscriptions:**
```typescript
// ❌ Bad - Re-renders on any store change
const state = useQuizStore()

// ✅ Good - Only re-renders when specific fields change
const currentQuestion = useQuizStore(state => state.currentQuestion)
const totalScore = useQuizStore(state => state.totalScore)

// ✅ Better - Memoized selector
const quizProgress = useQuizStore(
  useCallback(state => ({
    current: state.currentQuestion,
    total: state.questions.length,
    percentage: (state.currentQuestion / state.questions.length) * 100
  }), [])
)
```

**Virtual Scrolling for Large Lists:**
```typescript
// For large topic/question lists
import { FixedSizeList as List } from 'react-window'

const VirtualizedTopicList = ({ topics }: { topics: Topic[] }) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <TopicCard topic={topics[index]} />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={topics.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 2. Animation Performance

**GPU-Accelerated Animations:**
```typescript
// Use transform and opacity for smooth animations
const animationVariants = {
  initial: { 
    opacity: 0, 
    transform: 'translateY(20px) scale(0.95)' // GPU-accelerated
  },
  animate: { 
    opacity: 1, 
    transform: 'translateY(0px) scale(1)' 
  }
}

// Avoid animating layout properties
// ❌ Bad - Causes layout recalculation
const badVariants = {
  animate: { height: 'auto', width: '100%' }
}

// ✅ Good - GPU-accelerated
const goodVariants = {
  animate: { scaleY: 1, scaleX: 1 }
}
```

**Mobile-Optimized Animations:**
```typescript
// Reduce animation complexity on mobile
const getAnimationConfig = () => {
  const isMobile = window.innerWidth <= 768
  
  return {
    type: "spring",
    stiffness: isMobile ? 200 : 400,
    damping: isMobile ? 30 : 25,
    duration: isMobile ? 0.2 : 0.3
  }
}
```

### 3. Image Optimization

**Next.js Image Component:**
```typescript
import Image from 'next/image'

// Optimized image loading
<Image
  src="/topic-icon.png"
  alt="Topic icon"
  width={64}
  height={64}
  priority={isAboveTheFold} // Preload critical images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
/>
```

**Responsive Images:**
```typescript
// Serve different sizes based on screen
<Image
  src="/hero-image.jpg"
  alt="Hero"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
  style={{ objectFit: 'cover' }}
/>
```

## 🗄️ Data Loading Optimization

### 1. API Request Optimization

**Request Batching:**
```typescript
// Batch multiple API calls
const loadQuizData = async () => {
  const [topics, availability, userPrefs] = await Promise.all([
    strapiClient.getTopics(),
    strapiClient.getSubtopicAvailability(),
    loadUserPreferences()
  ])
  
  return { topics, availability, userPrefs }
}
```

**Request Deduplication:**
```typescript
// Prevent duplicate requests
const requestCache = new Map<string, Promise<any>>()

const getCachedData = async (key: string, fetcher: () => Promise<any>) => {
  if (requestCache.has(key)) {
    return requestCache.get(key)
  }
  
  const promise = fetcher()
  requestCache.set(key, promise)
  
  // Clean up after request completes
  promise.finally(() => {
    requestCache.delete(key)
  })
  
  return promise
}
```

**Pagination and Infinite Loading:**
```typescript
// Efficient pagination for large datasets
const usePaginatedTopics = (pageSize = 20) => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadMore = useCallback(async () => {
    const newTopics = await strapiClient.getTopics({
      page,
      pageSize
    })
    
    if (newTopics.length < pageSize) {
      setHasMore(false)
    }
    
    setTopics(prev => [...prev, ...newTopics])
    setPage(prev => prev + 1)
  }, [page, pageSize])

  return { topics, hasMore, loadMore }
}
```

### 2. Caching Strategies

**Memory Caching:**
```typescript
// Simple memory cache for API responses
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5 * 60 * 1000 // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string) {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear() {
    this.cache.clear()
  }
}

const apiCache = new MemoryCache()
```

**Persistent Caching with Zustand:**
```typescript
// Cache with automatic expiration
export const useSubtopicStore = create<SubtopicStore>()(
  persist(
    (set, get) => ({
      availability: {},
      lastUpdated: null,
      
      isStale: () => {
        const { lastUpdated } = get()
        if (!lastUpdated) return true
        return Date.now() - lastUpdated > CACHE_DURATION
      },
      
      setAvailability: (availability) => set({ 
        availability, 
        lastUpdated: Date.now() 
      })
    }),
    { name: 'subtopic-cache' }
  )
)
```

### 3. Background Data Loading

**Prefetching:**
```typescript
// Prefetch next page data
const useQuizPrefetch = () => {
  const router = useRouter()
  
  useEffect(() => {
    // Prefetch quiz page when user is on topics page
    if (router.pathname === '/topics') {
      router.prefetch('/quiz')
    }
  }, [router])
}
```

**Service Worker Caching:**
```typescript
// next.config.ts
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
    }
  ]
})

module.exports = withPWA({
  // Next.js config
})
```

## 📱 Mobile Performance

### 1. Touch Performance

**Touch Delay Optimization:**
```css
/* Remove 300ms tap delay */
.touch-element {
  touch-action: manipulation;
}

/* Prevent zoom on double tap */
.no-zoom {
  touch-action: pan-x pan-y;
}
```

**Passive Event Listeners:**
```typescript
// Use passive listeners for better scroll performance
useEffect(() => {
  const handleScroll = (e: Event) => {
    // Handle scroll
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}, [])
```

### 2. Memory Management

**Component Cleanup:**
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // Timer logic
  }, 1000)
  
  const subscription = eventEmitter.subscribe('event', handler)
  
  // Cleanup to prevent memory leaks
  return () => {
    clearInterval(timer)
    subscription.unsubscribe()
  }
}, [])
```

**Large Object Cleanup:**
```typescript
// Clean up large objects when component unmounts
useEffect(() => {
  return () => {
    // Clear large arrays/objects
    setLargeDataSet([])
    
    // Cancel pending requests
    abortController.abort()
  }
}, [])
```

## 🔍 Performance Monitoring

### 1. Core Web Vitals

**Largest Contentful Paint (LCP):**
```typescript
// Optimize LCP by preloading critical resources
<link rel="preload" href="/hero-image.jpg" as="image" />
<link rel="preload" href="/fonts/poppins.woff2" as="font" type="font/woff2" crossOrigin="" />
```

**First Input Delay (FID):**
```typescript
// Reduce JavaScript execution time
const heavyTask = () => {
  // Break up heavy tasks
  const processChunk = (items: any[], startIndex: number) => {
    const endIndex = Math.min(startIndex + 100, items.length)
    
    for (let i = startIndex; i < endIndex; i++) {
      // Process item
    }
    
    if (endIndex < items.length) {
      // Continue processing in next frame
      requestIdleCallback(() => processChunk(items, endIndex))
    }
  }
  
  processChunk(largeArray, 0)
}
```

**Cumulative Layout Shift (CLS):**
```typescript
// Prevent layout shifts with proper sizing
<div style={{ minHeight: '200px' }}>
  {isLoading ? (
    <LoadingSkeleton height={200} />
  ) : (
    <Content />
  )}
</div>
```

### 2. Performance Measurement

**Custom Performance Metrics:**
```typescript
// Measure custom performance metrics
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  
  console.log(`${name} took ${end - start} milliseconds`)
  
  // Track in analytics
  trackEvent('performance_metric', {
    metric_name: name,
    duration: end - start,
    timestamp: Date.now()
  })
}

// Usage
measurePerformance('quiz_load', () => {
  loadQuizQuestions()
})
```

**React Profiler:**
```typescript
import { Profiler } from 'react'

const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  // Log performance data
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration
  })
  
  // Track slow renders
  if (actualDuration > 16) { // Slower than 60fps
    trackEvent('slow_render', {
      component: id,
      duration: actualDuration,
      phase
    })
  }
}

<Profiler id="QuizGame" onRender={onRenderCallback}>
  <QuizGame />
</Profiler>
```

## 🎯 Performance Targets

### 1. Loading Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### 2. Runtime Performance

- **Frame Rate**: 60fps during animations
- **Memory Usage**: < 50MB on mobile
- **Bundle Size**: < 500KB total JavaScript
- **API Response Time**: < 500ms average

### 3. Mobile Performance

- **Touch Response**: < 50ms
- **Scroll Performance**: 60fps
- **Battery Impact**: Minimal
- **Data Usage**: < 1MB per session

## 🛠️ Performance Tools

### 1. Development Tools

```bash
# Bundle analysis
npm run build
npm run analyze

# Performance profiling
npm run dev
# Open Chrome DevTools > Performance tab

# Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Bundle size tracking
npm install -g bundlesize
bundlesize
```

### 2. Monitoring Tools

**Web Vitals Monitoring:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

const sendToAnalytics = (metric: any) => {
  trackEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

**Performance Observer:**
```typescript
// Monitor long tasks
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 50) { // Long task threshold
        trackEvent('long_task', {
          duration: entry.duration,
          start_time: entry.startTime,
          name: entry.name
        })
      }
    })
  })
  
  observer.observe({ entryTypes: ['longtask'] })
}
```

This comprehensive performance optimization strategy ensures the Gyan Pravah application delivers excellent user experience across all devices, with particular attention to mobile performance and accessibility.