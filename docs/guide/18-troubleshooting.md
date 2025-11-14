# Troubleshooting Guide

## 🔧 Common Issues and Solutions

This guide covers the most common issues you might encounter while developing or maintaining the Gyan Pravah application, along with step-by-step solutions.

## 🚀 Development Server Issues

### Issue: Development Server Won't Start

**Symptoms:**
- `npm run dev` fails to start
- Port already in use errors
- Module not found errors

**Solutions:**

```bash
# 1. Check if port 3000 is in use
lsof -ti:3000
# Kill the process if needed
kill -9 $(lsof -ti:3000)

# 2. Clear Next.js cache
npm run clean
rm -rf .next
rm -rf node_modules/.cache

# 3. Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# 4. Check Node.js version
node --version  # Should be 18+
npm --version   # Should be 8+

# 5. Start with different port
npm run dev -- -p 3001
```

### Issue: Hot Reload Not Working

**Symptoms:**
- Changes not reflected in browser
- Need to manually refresh page
- Console shows connection errors

**Solutions:**

```bash
# 1. Check file watcher limits (Linux/Mac)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 2. Disable browser cache
# Open DevTools > Network > Disable cache

# 3. Check for file path issues
# Ensure all imports use correct case
# Use absolute imports with @/ prefix

# 4. Restart development server
npm run clean
npm run dev
```

### Issue: TypeScript Errors

**Symptoms:**
- Red squiggly lines in VS Code
- Build fails with type errors
- Import errors for custom types

**Solutions:**

```bash
# 1. Check TypeScript configuration
npx tsc --noEmit  # Check for type errors

# 2. Restart TypeScript server in VS Code
# Ctrl+Shift+P > "TypeScript: Restart TS Server"

# 3. Check tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# 4. Install missing type definitions
npm install --save-dev @types/node @types/react @types/react-dom
```

## 🗄️ Database and API Issues

### Issue: Strapi Connection Failed

**Symptoms:**
- API calls return network errors
- "Failed to fetch" errors in console
- Timeout errors

**Solutions:**

```typescript
// 1. Check environment variables
console.log('Strapi URL:', process.env.NEXT_PUBLIC_STRAPI_URL)

// 2. Test Strapi connection
const testConnection = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/quiz-questions?pagination[limit]=1`)
    console.log('Connection test:', response.status)
  } catch (error) {
    console.error('Connection failed:', error)
  }
}

// 3. Check CORS settings in Strapi
// config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:3000', 'https://your-domain.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      headers: ['Content-Type', 'Authorization'],
    },
  },
  // ... other middlewares
]

// 4. Verify Strapi is running
curl http://localhost:1337/api/quiz-questions?pagination[limit]=1
```

### Issue: No Questions Loading

**Symptoms:**
- Empty quiz questions array
- "No questions available" messages
- API returns empty data

**Solutions:**

```typescript
// 1. Check Strapi data structure
const debugQuestions = async () => {
  try {
    const response = await strapiClient.getQuestions()
    console.log('Questions response:', response)
    console.log('Questions count:', response.length)
    
    if (response.length === 0) {
      console.log('No questions found - check Strapi content')
    }
  } catch (error) {
    console.error('Questions API error:', error)
  }
}

// 2. Check subtopic availability
const debugAvailability = async () => {
  const availability = await strapiClient.getSubtopicAvailability()
  console.log('Subtopic availability:', availability)
  
  const availableCount = Object.values(availability).filter(a => a.hasQuestions).length
  console.log('Available subtopics:', availableCount)
}

// 3. Check question filters
const debugFilters = async () => {
  // Test with no filters
  const allQuestions = await strapiClient.getQuestions()
  console.log('All questions:', allQuestions.length)
  
  // Test with specific filters
  const easyQuestions = await strapiClient.getQuestions({ difficulty: 'Easy' })
  console.log('Easy questions:', easyQuestions.length)
}
```

### Issue: Slow API Responses

**Symptoms:**
- Long loading times
- Timeout errors
- Poor user experience

**Solutions:**

```typescript
// 1. Add request timing
const timedRequest = async (requestName: string, request: () => Promise<any>) => {
  const start = performance.now()
  try {
    const result = await request()
    const end = performance.now()
    console.log(`${requestName} took ${end - start}ms`)
    return result
  } catch (error) {
    const end = performance.now()
    console.error(`${requestName} failed after ${end - start}ms:`, error)
    throw error
  }
}

// 2. Optimize Strapi queries
// Reduce populated fields
params.append('populate[quiz_topic][fields][0]', 'topicName')
params.append('populate[quiz_topic][fields][1]', 'slug')
// Don't populate unnecessary data

// 3. Implement caching
const cachedRequest = async (key: string, request: () => Promise<any>) => {
  const cached = localStorage.getItem(key)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes
      return data
    }
  }
  
  const result = await request()
  localStorage.setItem(key, JSON.stringify({
    data: result,
    timestamp: Date.now()
  }))
  
  return result
}
```

## 🎮 Quiz Functionality Issues

### Issue: Quiz State Not Persisting

**Symptoms:**
- Quiz resets on page refresh
- Lost progress when navigating
- Scores not saving

**Solutions:**

```typescript
// 1. Check Zustand persistence
// Verify store is using persist middleware
export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'quiz-store', // Check this key in localStorage
      partialize: (state) => ({
        // Only persist necessary fields
        questions: state.questions,
        selectedAnswers: state.selectedAnswers,
        totalScore: state.totalScore
      })
    }
  )
)

// 2. Debug localStorage
console.log('Quiz store data:', localStorage.getItem('quiz-store'))

// 3. Check for localStorage quota
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
} catch (error) {
  console.error('localStorage not available:', error)
}

// 4. Verify store hydration
const { hasHydrated } = useQuizStore()
if (!hasHydrated) {
  return <LoadingScreen />
}
```

### Issue: Timer Not Working Correctly

**Symptoms:**
- Timer doesn't count down
- Timer continues after answer selected
- Incorrect time calculations

**Solutions:**

```typescript
// 1. Check timer implementation
useEffect(() => {
  if (isAnswered || showFeedback || isReadingPeriod) {
    console.log('Timer paused:', { isAnswered, showFeedback, isReadingPeriod })
    return
  }

  console.log('Timer active, time remaining:', timeRemaining)
  
  const timer = setInterval(() => {
    setTimeRemaining(prev => {
      const newTime = Math.max(0, prev - 1)
      console.log('Timer tick:', newTime)
      return newTime
    })
  }, 1000)

  return () => {
    console.log('Timer cleanup')
    clearInterval(timer)
  }
}, [timeRemaining, isAnswered, showFeedback, isReadingPeriod])

// 2. Check for multiple timers
// Ensure only one timer is running
let timerRef = useRef<NodeJS.Timeout | null>(null)

const startTimer = () => {
  if (timerRef.current) {
    clearInterval(timerRef.current)
  }
  
  timerRef.current = setInterval(() => {
    setTimeRemaining(prev => Math.max(0, prev - 1))
  }, 1000)
}

// 3. Debug timer state
console.log('Timer state:', {
  timeRemaining,
  isAnswered,
  showFeedback,
  isReadingPeriod,
  currentQuestion
})
```

### Issue: Scoring Calculation Wrong

**Symptoms:**
- Incorrect point calculations
- Bonus points not applied
- Score doesn't match expectations

**Solutions:**

```typescript
// 1. Debug scoring calculation
const debugScoring = (isCorrect: boolean, timeRemaining: number, questionIndex: number) => {
  const config = getQuizConfig('quizup')
  const isBonus = isBonusRound(questionIndex, config)
  
  console.log('Scoring debug:', {
    isCorrect,
    timeRemaining,
    questionIndex,
    isBonus,
    config
  })
  
  const points = calculateQuestionPoints(isCorrect, timeRemaining, isBonus, config)
  console.log('Calculated points:', points)
  
  return points
}

// 2. Verify quiz configuration
const config = getQuizConfig('quizup')
console.log('Quiz config:', config)

// 3. Check bonus round detection
const checkBonusRounds = (totalQuestions: number) => {
  for (let i = 0; i < totalQuestions; i++) {
    const isBonus = isBonusRound(i, config)
    console.log(`Question ${i + 1}: ${isBonus ? 'BONUS' : 'NORMAL'}`)
  }
}
```

## 🎨 UI and Styling Issues

### Issue: Styles Not Applied

**Symptoms:**
- Components look unstyled
- Tailwind classes not working
- Custom styles not loading

**Solutions:**

```bash
# 1. Check Tailwind configuration
npx tailwindcss -i ./app/globals.css -o ./output.css --watch

# 2. Verify Tailwind content paths
// tailwind.config.ts
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}

# 3. Check CSS imports
// app/globals.css should be imported in layout.tsx
import './globals.css'

# 4. Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Design System Colors Not Working

**Symptoms:**
- Colors appear different than expected
- Custom colors not applied
- Gradient warnings in console

**Solutions:**

```typescript
// 1. Check color usage
// ❌ Wrong - using gradients
className="bg-gradient-to-r from-purple-500 to-pink-500"

// ✅ Correct - using solid colors
className="bg-[#8B7FC8]"

// 2. Verify color constants
const DESIGN_COLORS = {
  primary: '#8B7FC8',
  primaryDark: '#6B5FA8',
  primaryLight: '#B4A5E8',
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24'
}

// 3. Check Tailwind custom colors
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-purple': '#8B7FC8',
        // ... other custom colors
      }
    }
  }
}
```

### Issue: Mobile Layout Problems

**Symptoms:**
- Layout breaks on mobile
- Touch targets too small
- Horizontal scrolling

**Solutions:**

```typescript
// 1. Check responsive classes
// Use mobile-first approach
className="
  w-full p-3 text-sm          // Mobile
  sm:w-auto sm:p-4 sm:text-base  // Small screens
  md:max-w-md md:p-6 md:text-lg  // Medium screens
"

// 2. Verify touch target sizes
className="min-h-touch-lg" // 48px minimum

// 3. Check viewport meta tag
// app/layout.tsx should have:
<meta name="viewport" content="width=device-width, initial-scale=1" />

// 4. Debug mobile layout
const debugMobile = () => {
  console.log('Screen size:', {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768
  })
}
```

## 📱 Mobile-Specific Issues

### Issue: Touch Events Not Working

**Symptoms:**
- Buttons don't respond to touch
- Swipe gestures not working
- Delayed touch response

**Solutions:**

```typescript
// 1. Check touch event handlers
import { handleTouchPress } from '@/lib/mobile-gestures'

// Use proper touch handling
<button onClick={() => handleTouchPress(handleClick)}>
  Click me
</button>

// 2. Verify touch-action CSS
.touch-element {
  touch-action: manipulation; /* Removes 300ms delay */
}

// 3. Check for event conflicts
// Ensure no event.preventDefault() on touch events
const handleTouch = (e: TouchEvent) => {
  // Don't prevent default unless necessary
  // e.preventDefault()
}

// 4. Debug touch events
const debugTouch = () => {
  console.log('Touch support:', {
    touchStart: 'ontouchstart' in window,
    maxTouchPoints: navigator.maxTouchPoints,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  })
}
```

### Issue: Performance Issues on Mobile

**Symptoms:**
- Slow animations
- Laggy scrolling
- High memory usage

**Solutions:**

```typescript
// 1. Optimize animations for mobile
const getMobileAnimationConfig = () => ({
  type: "tween",
  duration: 0.2, // Shorter duration
  ease: "easeOut"
})

// 2. Use GPU-accelerated properties
// ✅ Good - GPU accelerated
transform: 'translateX(100px) scale(1.1)'

// ❌ Bad - CPU intensive
left: '100px', width: '110%'

// 3. Implement virtual scrolling for long lists
import { FixedSizeList as List } from 'react-window'

// 4. Monitor memory usage
const monitorMemory = () => {
  if ('memory' in performance) {
    console.log('Memory usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
    })
  }
}
```

## 🔍 Analytics and Tracking Issues

### Issue: Analytics Not Tracking

**Symptoms:**
- No events in PostHog dashboard
- Console errors about analytics
- Missing user data

**Solutions:**

```typescript
// 1. Check PostHog initialization
console.log('PostHog initialized:', !!window.posthog)
console.log('PostHog config:', {
  key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST
})

// 2. Verify environment variables
// .env.local
NEXT_PUBLIC_POSTHOG_KEY=your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

// 3. Check event tracking
const debugTracking = () => {
  trackEvent('test_event', { test: true })
  console.log('Test event sent')
}

// 4. Verify user identification
const debugUser = () => {
  const userId = getUserId()
  console.log('User ID:', userId)
  
  identifyUser(userId, { test_user: true })
}

// 5. Check for ad blockers
const checkAdBlocker = () => {
  if (window.posthog && window.posthog.has_opted_out_capturing()) {
    console.log('User has opted out of tracking')
  }
}
```

## 🛠️ Build and Deployment Issues

### Issue: Build Fails

**Symptoms:**
- `npm run build` fails
- TypeScript errors during build
- Out of memory errors

**Solutions:**

```bash
# 1. Check for TypeScript errors
npx tsc --noEmit

# 2. Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 3. Clear all caches
npm run clean
rm -rf .next
rm -rf node_modules/.cache
npm run build

# 4. Check for circular dependencies
npx madge --circular --extensions ts,tsx ./

# 5. Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

### Issue: Environment Variables Not Working

**Symptoms:**
- API calls fail in production
- Features work in dev but not production
- Undefined environment variables

**Solutions:**

```bash
# 1. Check environment variable names
# Must start with NEXT_PUBLIC_ for client-side access
NEXT_PUBLIC_STRAPI_URL=https://api.example.com

# 2. Verify .env files
# .env.local (development)
# .env.production (production)

# 3. Check Next.js environment loading
console.log('Environment:', process.env.NODE_ENV)
console.log('Strapi URL:', process.env.NEXT_PUBLIC_STRAPI_URL)

# 4. Verify deployment platform settings
# Check Vercel/Netlify environment variables
```

## 🆘 Emergency Debugging

### Quick Diagnostic Commands

```bash
# Check system status
node --version
npm --version
git status

# Check running processes
lsof -ti:3000
ps aux | grep node

# Check disk space
df -h

# Check memory usage
free -h  # Linux
vm_stat  # macOS

# Network connectivity
ping google.com
curl -I https://your-api.com

# Clear everything and restart
npm run clean
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Debug Mode Setup

```typescript
// Enable debug mode
const DEBUG = process.env.NODE_ENV === 'development'

// Debug logging
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data)
  }
}

// Error boundary with debug info
export class DebugErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (DEBUG) {
      console.error('Error boundary caught:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }
}
```

### Performance Debugging

```typescript
// Monitor performance
const performanceMonitor = {
  start: (label: string) => {
    performance.mark(`${label}-start`)
  },
  
  end: (label: string) => {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    
    const measure = performance.getEntriesByName(label)[0]
    console.log(`${label}: ${measure.duration}ms`)
  }
}

// Usage
performanceMonitor.start('quiz-load')
// ... quiz loading logic
performanceMonitor.end('quiz-load')
```

## 📞 Getting Help

### Before Asking for Help

1. **Check the console** - Look for error messages
2. **Reproduce the issue** - Can you make it happen again?
3. **Check recent changes** - What was changed recently?
4. **Test in different browsers** - Is it browser-specific?
5. **Check mobile vs desktop** - Is it device-specific?

### Information to Include

When reporting issues, include:

- **Environment details** (OS, browser, Node.js version)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Console errors** (screenshots or text)
- **Network tab** information for API issues
- **Recent changes** made to the codebase

### Useful Debug Information

```typescript
// System information
const getSystemInfo = () => ({
  userAgent: navigator.userAgent,
  screen: `${screen.width}x${screen.height}`,
  viewport: `${window.innerWidth}x${window.innerHeight}`,
  pixelRatio: window.devicePixelRatio,
  online: navigator.onLine,
  language: navigator.language,
  platform: navigator.platform,
  cookieEnabled: navigator.cookieEnabled,
  localStorage: typeof Storage !== 'undefined',
  sessionStorage: typeof sessionStorage !== 'undefined'
})

console.log('System info:', getSystemInfo())
```

This troubleshooting guide should help you resolve most common issues. Remember to always check the browser console first, as it often contains the most helpful error messages and debugging information.