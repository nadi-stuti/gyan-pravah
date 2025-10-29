# Development Guide

## 🚀 Getting Started

This guide will help you become proficient in developing and maintaining the Gyan Pravah Next.js application.

## 📋 Prerequisites

Before you start, ensure you have:

- **Node.js 18+** - Latest LTS version recommended
- **npm or pnpm** - Package manager (pnpm preferred for workspace)
- **Git** - Version control
- **VS Code** - Recommended editor with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Auto Rename Tag
  - Prettier - Code formatter

## 🛠️ Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd gyan-pravah

# Install dependencies (from root)
pnpm install

# Navigate to app directory
cd app

# Install app-specific dependencies
npm install
```

### 2. Environment Configuration

Create environment files in the `app` directory:

```bash
# .env.local (for development)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

```bash
# .env.production (for production)
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-domain.com
NEXT_PUBLIC_POSTHOG_KEY=your_production_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### 3. Start Development Server

```bash
# From app directory
npm run dev

# The app will be available at http://localhost:3000
```

## 🏗️ Project Structure Deep Dive

### Understanding the Architecture

```
app/
├── app/                    # Next.js App Router (pages)
│   ├── layout.tsx         # Root layout with fonts and metadata
│   ├── page.tsx           # Home page with first-visit logic
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── quiz/              # Quiz game route
│   ├── topics/            # Topic selection routes
│   └── results/           # Quiz results route
├── components/            # React components
│   ├── ui/               # Design system components
│   ├── quiz/             # Quiz-specific components
│   ├── home/             # Home page components
│   ├── layout/           # Layout components
│   └── navigation/       # Navigation components
├── lib/                  # Utilities and services
│   ├── strapi.ts         # Strapi API client
│   ├── analytics.ts      # PostHog analytics
│   ├── quiz-config.ts    # Quiz configuration
│   └── mobile-*.ts       # Mobile optimizations
├── stores/               # Zustand state stores
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

### Key Files to Understand

**Core Application Files:**
- `app/layout.tsx` - Root layout, font loading, metadata
- `app/page.tsx` - Home page with first-visit detection
- `components/layout/ClientLayout.tsx` - Client-side layout wrapper

**State Management:**
- `stores/useQuizStore.ts` - Quiz game state
- `stores/useUserPreferences.ts` - User settings (persisted)
- `stores/useSubtopicStore.ts` - Topic availability cache

**API Integration:**
- `lib/strapi.ts` - Main Strapi client with all API methods
- `lib/api-client.ts` - Enhanced client with retry logic
- `lib/quiz-api.ts` - Quiz-specific API operations

**Quiz System:**
- `components/quiz/QuizGameLogic.tsx` - Core quiz orchestration
- `components/quiz/QuestionCard.tsx` - Question display
- `lib/quiz-config.ts` - Quiz modes and scoring

## 🎯 Development Workflow

### 1. Feature Development Process

**Step 1: Plan the Feature**
```bash
# Create a feature branch
git checkout -b feature/new-quiz-mode

# Document the feature requirements
# - What does it do?
# - How does it integrate with existing code?
# - What components need changes?
```

**Step 2: Implement the Feature**
```typescript
// Example: Adding a new quiz mode
// 1. Update quiz-config.ts
export const QUIZ_CONFIGS = {
  // ... existing configs
  'speed-round': {
    totalQuestions: 10,
    questionTimeLimit: 5, // Very fast!
    maxPointsPerNormalQuestion: 30,
    maxPointsPerBonusQuestion: 60,
    bonusRoundStart: 8,
    feedbackDuration: 1000
  } as QuizConfig
}

// 2. Update type definitions
export type QuizMode = 'quizup' | 'quick' | 'marathon' | 'first-visit' | 'speed-round'

// 3. Add UI for mode selection
// 4. Test the implementation
```

**Step 3: Test Your Changes**
```bash
# Run the development server
npm run dev

# Test on different screen sizes
# Test the complete user flow
# Check browser console for errors
# Verify analytics tracking
```

**Step 4: Code Review Checklist**
- [ ] Follows TypeScript best practices
- [ ] Uses design system colors (no gradients)
- [ ] Mobile-first responsive design
- [ ] Proper error handling
- [ ] Analytics tracking added
- [ ] Performance optimized
- [ ] Accessibility considered

### 2. Component Development

**Creating a New Component:**

```typescript
// components/ui/NewComponent.tsx
'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { getAccessibleVariants, cardAnimationVariants } from '@/lib/mobile-animations'
import { handleTouchPress } from '@/lib/mobile-gestures'

interface NewComponentProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  className?: string
}

export default function NewComponent({
  children,
  variant = 'primary',
  onClick,
  className = ''
}: NewComponentProps) {
  const baseClasses = 'font-poppins rounded-xl transition-colors'
  
  const variantClasses = {
    primary: 'bg-[#8B7FC8] text-white', // Use design system colors
    secondary: 'bg-white text-gray-900 border-2 border-gray-200'
  }
  
  return (
    <motion.div
      variants={getAccessibleVariants(cardAnimationVariants)}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick ? () => handleTouchPress(onClick) : undefined}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </motion.div>
  )
}
```

**Component Best Practices:**
- Always use TypeScript interfaces for props
- Follow the design system (no gradients, approved colors)
- Include mobile optimizations
- Add proper accessibility attributes
- Use motion for animations
- Handle touch interactions properly

### 3. State Management

**Adding New State:**

```typescript
// stores/useNewStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NewState {
  data: any[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setData: (data: any[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearData: () => void
}

export const useNewStore = create<NewState>()(
  persist(
    (set) => ({
      data: [],
      isLoading: false,
      error: null,
      
      setData: (data) => set({ data, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearData: () => set({ data: [], error: null }),
    }),
    {
      name: 'new-store',
      partialize: (state) => ({ data: state.data }), // Only persist data
    }
  )
)
```

**Using the Store:**

```typescript
// In a component
const { data, isLoading, error, setData, setLoading } = useNewStore()

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true)
      const result = await apiClient.getData()
      setData(result)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }
  
  loadData()
}, [])
```

### 4. API Integration

**Adding New API Endpoints:**

```typescript
// lib/strapi.ts - Add to StrapiClient class
async getNewData(filters: any = {}): Promise<NewDataType[]> {
  const params = new URLSearchParams()
  
  // Add filters
  if (filters.category) {
    params.append('filters[category][$eq]', filters.category)
  }
  
  // Add population
  params.append('populate[related_field][fields][0]', 'name')
  
  const response = await this.client.get<NewDataResponse>(
    `/api/new-data?${params.toString()}`
  )
  
  return response.data.data
}
```

**Using the API:**

```typescript
// In a component or hook
const loadNewData = async () => {
  try {
    const data = await strapiClient.getNewData({ category: 'example' })
    // Handle success
  } catch (error) {
    // Handle error
    console.error('Failed to load data:', error)
  }
}
```

## 🎨 Design System Guidelines

### Color Usage

```typescript
// ✅ CORRECT - Use approved colors
const correctColors = {
  primary: '#8B7FC8',      // Primary purple
  primaryDark: '#6B5FA8',  // Dark purple
  primaryLight: '#B4A5E8', // Light purple
  success: '#4ADE80',      // Green
  error: '#F87171',        // Red
  warning: '#FBBF24',      // Yellow
  white: '#FFFFFF'
}

// ❌ WRONG - Don't use gradients
className="bg-gradient-to-r from-purple-500 to-pink-500" // Never do this

// ✅ CORRECT - Use solid colors
className="bg-[#8B7FC8]" // Always do this
```

### Typography

```typescript
// Always use Poppins font
className="font-poppins font-medium text-lg"

// Responsive text sizing
className="text-sm sm:text-base md:text-lg"
```

### Spacing and Layout

```typescript
// Mobile-first responsive spacing
className="p-3 sm:p-4 md:p-6"

// Touch-friendly sizing
className="min-h-touch-lg" // 48px minimum for touch targets
```

## 📱 Mobile Development

### Touch Interactions

```typescript
// Always use handleTouchPress for buttons
import { handleTouchPress } from '@/lib/mobile-gestures'

<button onClick={() => handleTouchPress(handleClick)}>
  Click me
</button>
```

### Responsive Design

```typescript
// Mobile-first approach
className="
  w-full                    // Mobile: full width
  sm:w-auto                // Small screens: auto width
  md:max-w-md              // Medium screens: max width
  lg:max-w-lg              // Large screens: larger max width
"
```

### Animations

```typescript
// Use mobile-optimized animations
import { getAccessibleVariants, cardAnimationVariants } from '@/lib/mobile-animations'

<motion.div
  variants={getAccessibleVariants(cardAnimationVariants)}
  initial="initial"
  animate="animate"
>
```

## 🔍 Debugging and Testing

### Development Tools

**Browser DevTools:**
```bash
# Open React DevTools
# Install React Developer Tools extension

# Check Zustand state
# Install Zustand DevTools extension

# Monitor network requests
# Use Network tab to check API calls

# Check mobile responsiveness
# Use Device Toolbar (Ctrl+Shift+M)
```

**Console Debugging:**
```typescript
// Debug Zustand stores
console.log('Quiz state:', useQuizStore.getState())

// Debug API calls
console.log('API response:', response.data)

// Debug component renders
console.log('Component rendered with props:', props)
```

### Common Issues and Solutions

**Issue: Component not re-rendering**
```typescript
// Problem: Not subscribing to specific store fields
const state = useQuizStore() // Re-renders on any state change

// Solution: Subscribe to specific fields
const currentQuestion = useQuizStore(state => state.currentQuestion)
const totalScore = useQuizStore(state => state.totalScore)
```

**Issue: API calls failing**
```typescript
// Check network connectivity
const status = await checkConnectionStatus()
if (!status.isOnline) {
  // Handle offline state
}

// Check error types
if (isNetworkError(error)) {
  // Show network error message
} else if (isServerError(error)) {
  // Show server error message
}
```

**Issue: Animations not working on mobile**
```typescript
// Use mobile-optimized animations
import { getAccessibleVariants } from '@/lib/mobile-animations'

// Check for reduced motion preference
const variants = getAccessibleVariants(animationVariants)
```

### Performance Optimization

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build
npm run analyze # If analyzer is configured

# Check for large dependencies
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

**Performance Monitoring:**
```typescript
// Monitor component render times
import { Profiler } from 'react'

<Profiler id="QuizGame" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`)
}}>
  <QuizGame />
</Profiler>
```

## 🚀 Deployment

### Build Process

```bash
# Clean build
npm run clean
npm run build

# Test production build locally
npm run start
```

### Environment Variables

```bash
# Production environment variables
NEXT_PUBLIC_STRAPI_URL=https://your-production-strapi.com
NEXT_PUBLIC_POSTHOG_KEY=your_production_key
```

### Deployment Checklist

- [ ] All environment variables configured
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Performance metrics acceptable
- [ ] Mobile testing completed
- [ ] Analytics tracking verified

## 📚 Learning Resources

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [TypeScript with Next.js](https://nextjs.org/docs/basic-features/typescript)

### React Resources
- [React Documentation](https://react.dev)
- [React Hooks Guide](https://react.dev/reference/react)
- [Motion Documentation](https://motion.dev)

### State Management
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand/wiki/Best-Practices)

### Mobile Development
- [Mobile Web Best Practices](https://web.dev/mobile/)
- [Touch-Friendly Design](https://developers.google.com/web/fundamentals/design-and-ux/input/touch)

## 🤝 Contributing Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use the design system colors and spacing
- Write mobile-first responsive code
- Include proper error handling
- Add analytics tracking for user interactions

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/description

# Make commits with clear messages
git commit -m "feat: add new quiz mode with speed round"

# Push and create pull request
git push origin feature/description
```

### Pull Request Checklist

- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Mobile responsiveness tested
- [ ] Error handling implemented
- [ ] Analytics tracking added
- [ ] Documentation updated if needed
- [ ] No console errors or warnings

This development guide provides the foundation for becoming proficient in the Gyan Pravah codebase. Focus on understanding the architecture, following the established patterns, and maintaining the mobile-first, accessible design principles.