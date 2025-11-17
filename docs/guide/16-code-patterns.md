# Code Patterns and Best Practices

## 🎯 Overview

**Note:** As of v2.3, code patterns have been simplified to focus on straightforward implementations. Complex abstractions, wrapper components, and over-engineered patterns have been removed in favor of direct, maintainable code.

This document outlines the established code patterns, conventions, and best practices used throughout the Gyan Pravah application. Following these patterns ensures consistency, maintainability, and optimal performance.

## 🏗️ Component Patterns

### 1. Server Component Template (Preferred)

```typescript
// Server component (default) - no 'use client' directive
import { ComponentProps } from '@gyan-pravah/types'

interface ComponentNameProps {
  data: DataType
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function ComponentName({
  data,
  variant = 'primary',
  className = ''
}: ComponentNameProps) {
  // Server components are simple and direct
  const variantClasses = variant === 'primary' 
    ? 'bg-[#8B7FC8] text-white' 
    : 'bg-white text-gray-900'
  
  return (
    <div className={`font-poppins rounded-xl ${variantClasses} ${className}`}>
      {/* Component content */}
      <h2>{data.title}</h2>
      <p>{data.description}</p>
    </div>
  )
}
```

### 2. Client Component Template (When Needed)

```typescript
'use client' // Only when interactivity is required

import { useState, useCallback } from 'react'
import { motion } from 'motion/react'

interface ComponentNameProps {
  data: DataType
  onAction: (value: string) => void
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function ComponentName({
  data,
  onAction,
  variant = 'primary',
  className = ''
}: ComponentNameProps) {
  const [localState, setLocalState] = useState<StateType>(initialValue)
  
  const handleAction = useCallback(() => {
    onAction(value)
  }, [onAction, value])
  
  // Early returns for edge cases
  if (!data) return <div>Loading...</div>
  
  return (
    <motion.button
      onClick={handleAction}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`font-poppins rounded-xl ${className}`}
    >
      {data.label}
    </motion.button>
  )
}
```

**Key Principles:**
- **Server by default** - Only use 'use client' when necessary
- **Simple and direct** - Avoid complex abstractions
- **Minimal dependencies** - Import only what you need
- **Clear structure** - Easy to understand and maintain

### 2. Props Interface Patterns

```typescript
// Base interface pattern
interface BaseComponentProps {
  children?: ReactNode
  className?: string
  disabled?: boolean
}

// Extending base interface
interface SpecificComponentProps extends BaseComponentProps {
  // Specific props
  data: DataType
  onAction: (value: string) => void
  
  // Variant system
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

// Event handler patterns
interface EventHandlerProps {
  onClick?: () => void
  onSubmit?: (data: FormData) => void
  onError?: (error: Error) => void
  onSuccess?: (result: any) => void
}
```

### 3. Conditional Rendering Patterns

```typescript
// Early returns for loading/error states
if (isLoading) return <LoadingScreen />
if (error) return <ErrorScreen error={error} onRetry={handleRetry} />
if (!data) return <EmptyState />

// Conditional content rendering
return (
  <div>
    {/* Conditional sections */}
    {showHeader && <Header />}
    
    {/* Conditional with fallback */}
    {data?.items?.length > 0 ? (
      <ItemList items={data.items} />
    ) : (
      <EmptyState message="No items found" />
    )}
    
    {/* Complex conditional */}
    {isAuthenticated && hasPermission && (
      <AdminPanel />
    )}
  </div>
)
```

## 🎨 Styling Patterns

### 1. Design System Classes

```typescript
// Color system - NEVER use gradients
const colorClasses = {
  primary: 'bg-[#8B7FC8] text-white',
  primaryDark: 'bg-[#6B5FA8] text-white',
  primaryLight: 'bg-[#B4A5E8] text-white',
  success: 'bg-green-400 text-white',
  error: 'bg-red-400 text-white',
  warning: 'bg-yellow-400 text-gray-900',
  neutral: 'bg-gray-300 text-gray-900',
  white: 'bg-white text-gray-900'
}

// Size system
const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-touch',
  md: 'px-4 py-3 text-base min-h-touch-lg',
  lg: 'px-6 py-4 text-lg min-h-touch-lg'
}

// Responsive patterns
const responsiveClasses = {
  spacing: 'p-3 sm:p-4 md:p-6',
  text: 'text-sm sm:text-base md:text-lg',
  layout: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}
```

### 2. Component Styling Pattern

```typescript
export default function StyledComponent({ variant, size, className }: Props) {
  const baseClasses = 'font-poppins rounded-xl transition-colors focus:outline-none'
  const variantClasses = colorClasses[variant]
  const sizeClasses = sizeClasses[size]
  
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`
  
  return (
    <div className={combinedClasses}>
      {/* Content */}
    </div>
  )
}
```

### 3. Responsive Design Pattern

```typescript
// Mobile-first responsive design
className="
  // Mobile (default)
  w-full p-3 text-sm
  
  // Small screens (640px+)
  sm:w-auto sm:p-4 sm:text-base
  
  // Medium screens (768px+)
  md:max-w-md md:p-6 md:text-lg
  
  // Large screens (1024px+)
  lg:max-w-lg lg:p-8 lg:text-xl
"
```

## 🔄 State Management Patterns

### 1. Zustand Store Pattern

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreState {
  // Data
  items: Item[]
  currentItem: Item | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Computed values (if needed)
  itemCount: number
  
  // Actions
  setItems: (items: Item[]) => void
  setCurrentItem: (item: Item | null) => void
  addItem: (item: Item) => void
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  
  // Async actions
  loadItems: () => Promise<void>
  saveItem: (item: Item) => Promise<void>
  
  // Utility actions
  clearError: () => void
  reset: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      currentItem: null,
      isLoading: false,
      error: null,
      
      // Computed values
      get itemCount() {
        return get().items.length
      },
      
      // Synchronous actions
      setItems: (items) => set({ items, error: null }),
      setCurrentItem: (currentItem) => set({ currentItem }),
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      
      // Async actions
      loadItems: async () => {
        try {
          set({ isLoading: true, error: null })
          const items = await apiClient.getItems()
          set({ items, isLoading: false })
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false })
        }
      },
      
      // Utility actions
      clearError: () => set({ error: null }),
      reset: () => set({
        items: [],
        currentItem: null,
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'store-name',
      partialize: (state) => ({
        items: state.items,
        currentItem: state.currentItem
      })
    }
  )
)
```

### 2. Persisted Store with Hydration Pattern

For stores that persist to localStorage, handle hydration to prevent SSR/client mismatches:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PersistedStoreState {
  // Data
  preferences: UserPreferences
  
  // Hydration state
  hydrated: boolean
  
  // Actions
  setPreferences: (prefs: UserPreferences) => void
  setHydrated: (hydrated: boolean) => void
}

export const usePersistedStore = create<PersistedStoreState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      hydrated: false,
      
      setPreferences: (preferences) => set({ preferences }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'persisted-store',
      onRehydrateStorage: () => (state) => {
        // Mark hydration complete after rehydration
        state?.setHydrated(true)
      },
    }
  )
)

// Usage in component
function Component() {
  const { preferences, hydrated } = usePersistedStore()
  
  // Wait for hydration before using persisted data
  if (!hydrated) {
    return <LoadingScreen />
  }
  
  return <div>{preferences.theme}</div>
}
```

### 3. Store Usage Pattern

```typescript
// Component using store
export default function Component() {
  // Subscribe to specific fields to prevent unnecessary re-renders
  const items = useStore(state => state.items)
  const isLoading = useStore(state => state.isLoading)
  const error = useStore(state => state.error)
  
  // Get actions
  const { loadItems, addItem, clearError } = useStore()
  
  // Load data on mount
  useEffect(() => {
    loadItems()
  }, [loadItems])
  
  // Handle actions
  const handleAddItem = useCallback((newItem: Item) => {
    addItem(newItem)
    trackEvent('item_added', { itemType: newItem.type })
  }, [addItem])
  
  // Render with proper error handling
  if (error) {
    return <ErrorState error={error} onRetry={loadItems} onDismiss={clearError} />
  }
  
  return (
    <div>
      {isLoading ? <LoadingState /> : <ItemList items={items} onAdd={handleAddItem} />}
    </div>
  )
}
```

## 🔌 API Integration Patterns

### 1. Server-Side API Pattern (Preferred)

```typescript
// lib/strapi-server.ts - Server-only API functions
export async function getItems(filters?: ItemFilters): Promise<Item[]> {
  const params = new URLSearchParams()
  
  // Add filters
  if (filters?.category) {
    params.append('filters[category][$eq]', filters.category)
  }
  
  // Add population
  params.append('populate', '*')
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/items?${params.toString()}`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`)
  }
  
  const json = await response.json()
  return json.data
}

// Usage in server component
export default async function ItemsPage() {
  const items = await getItems({ category: 'featured' })
  
  return <ItemList items={items} />
}
```

### 2. Client-Side API Pattern (When Needed)

```typescript
// lib/strapi.ts - Client-side API (minimal usage)
export async function getItemsClient(filters?: ItemFilters): Promise<Item[]> {
  const params = new URLSearchParams()
  
  if (filters?.category) {
    params.append('filters[category][$eq]', filters.category)
  }
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/items?${params.toString()}`
  )
  
  if (!response.ok) throw new Error('Failed to fetch')
  
  const json = await response.json()
  return json.data
}

// Usage in client component
'use client'
export default function ItemsClient() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    getItemsClient().then(setItems).finally(() => setIsLoading(false))
  }, [])
  
  if (isLoading) return <div>Loading...</div>
  
  return <ItemList items={items} />
}
```

**Key Principles:**
- **Server-side by default** - Use server components for data fetching
- **Simple fetch** - No complex axios setup or interceptors
- **Built-in caching** - Use Next.js fetch caching
- **Direct error handling** - Simple try/catch, no complex error transformations

## 🎭 Animation Patterns

### 1. Simple Component Animation

```typescript
'use client'
import { motion } from 'motion/react'

export default function AnimatedComponent({ children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

### 2. Interactive Button Animation

```typescript
'use client'
import { motion } from 'motion/react'

export default function AnimatedButton({ children, onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl"
    >
      {children}
    </motion.button>
  )
}
```

### 3. Minimal Page Transition

```typescript
// In ClientLayout component
'use client'
export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0.8, x: 3 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0.8, x: -3 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**Key Principles:**
- **Simple and direct** - No complex variant systems
- **Minimal movement** - Subtle animations (3px, not 20px)
- **Fast transitions** - 150-300ms duration
- **Performance first** - Use transform and opacity only

## 📊 Analytics Patterns

### 1. Event Tracking Pattern

```typescript
// Define event types
interface AnalyticsEvents {
  'button_clicked': {
    button_name: string
    context: string
    user_type?: string
  }
  
  'page_viewed': {
    page_name: string
    referrer?: string
    user_id?: string
  }
}

// Type-safe tracking function
export function trackEvent<K extends keyof AnalyticsEvents>(
  eventName: K,
  properties: AnalyticsEvents[K]
): void {
  if (typeof window !== 'undefined' && analytics) {
    analytics.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  }
}

// Usage in components
const handleButtonClick = () => {
  trackEvent('button_clicked', {
    button_name: 'play_now',
    context: 'home_page',
    user_type: isExpertMode ? 'expert' : 'normal'
  })
  
  // Perform action
  startQuiz()
}
```

### 2. User Journey Tracking

```typescript
// Track user journey milestones
export function trackUserJourney(milestone: string, context?: Record<string, any>) {
  trackEvent('user_journey', {
    milestone,
    ...context,
    session_id: getSessionId(),
    user_id: getUserId()
  })
}

// Usage
trackUserJourney('quiz_started', { mode: 'expert', topic: 'math' })
trackUserJourney('quiz_completed', { score: 85, time_taken: 120 })
```

## 🔧 Error Handling Patterns

### 1. Error Boundary Pattern

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Track error
    trackEvent('error_boundary_triggered', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack
    })
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }
    
    return this.props.children
  }
}
```

### 2. Async Error Handling Pattern

```typescript
// Hook for async error handling
export function useAsyncError() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const execute = useCallback(async <T>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await asyncFunction()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      
      // Track error
      trackEvent('async_error', {
        error_message: error.message,
        error_stack: error.stack
      })
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  return { error, isLoading, execute, clearError: () => setError(null) }
}

// Usage
const { error, isLoading, execute } = useAsyncError()

const handleAction = async () => {
  const result = await execute(async () => {
    return await apiService.performAction()
  })
  
  if (result) {
    // Handle success
  }
}
```

## 🧪 Testing Patterns

### 1. Component Testing Pattern

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Component from './Component'

// Mock dependencies
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn()
}))

describe('Component', () => {
  const defaultProps = {
    data: mockData,
    onAction: vi.fn()
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('renders correctly', () => {
    render(<Component {...defaultProps} />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', async () => {
    const onAction = vi.fn()
    render(<Component {...defaultProps} onAction={onAction} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith(expectedValue)
    })
  })
  
  it('handles error state', () => {
    render(<Component {...defaultProps} error="Test error" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })
})
```

### 2. Store Testing Pattern

```typescript
import { renderHook, act } from '@testing-library/react'
import { useStore } from './useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store state
    useStore.getState().reset()
  })
  
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useStore())
    
    expect(result.current.items).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })
  
  it('adds item correctly', () => {
    const { result } = renderHook(() => useStore())
    
    act(() => {
      result.current.addItem(mockItem)
    })
    
    expect(result.current.items).toContain(mockItem)
  })
})
```

## 📝 Summary of v2.3 Pattern Changes

### Removed Patterns
- ❌ Complex animation variant systems
- ❌ Axios-based API clients with interceptors
- ❌ Custom error handling wrappers
- ❌ Over-engineered hook patterns
- ❌ Unnecessary abstraction layers

### New Patterns
- ✅ Server components by default
- ✅ Simple fetch with Next.js caching
- ✅ Direct Motion animations
- ✅ Minimal client-side state
- ✅ Straightforward implementations

### Key Principles
1. **Server-first** - Use server components whenever possible
2. **Simple and direct** - Avoid unnecessary abstractions
3. **Performance-focused** - Smaller bundles, faster loading
4. **Maintainable** - Easy to understand and modify
5. **Type-safe** - TypeScript for all code

These simplified patterns provide a solid foundation for consistent, maintainable, and performant code throughout the Gyan Pravah application. Always prefer simplicity over complexity when implementing new features.

---

**Last Updated:** November 15, 2025  
**Version:** 2.3 - Simplified Patterns  
**Previous:** 2.2 - Complex Patterns (deprecated)