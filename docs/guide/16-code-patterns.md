# Code Patterns and Best Practices

## 🎯 Overview

This document outlines the established code patterns, conventions, and best practices used throughout the Gyan Pravah application. Following these patterns ensures consistency, maintainability, and optimal performance.

## 🏗️ Component Patterns

### 1. Component Structure Template

```typescript
'use client' // Only if client-side features needed

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { ComponentProps } from '@gyan-pravah/types'
import { useStore } from '@/stores/useStore'
import { trackEvent } from '@/lib/analytics'
import { getAccessibleVariants, animationVariants } from '@/lib/mobile-animations'
import { handleTouchPress } from '@/lib/mobile-gestures'

interface ComponentNameProps {
  // Required props first
  data: DataType
  onAction: (value: string) => void
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary'
  className?: string
  disabled?: boolean
}

export default function ComponentName({
  data,
  onAction,
  variant = 'primary',
  className = '',
  disabled = false
}: ComponentNameProps) {
  // 1. State hooks
  const [localState, setLocalState] = useState<StateType>(initialValue)
  
  // 2. Store hooks
  const { storeValue, storeAction } = useStore()
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])
  
  // 4. Callbacks
  const handleAction = useCallback(() => {
    // Track user action
    trackEvent('action_performed', { context: 'component_name' })
    
    // Perform action
    onAction(value)
  }, [onAction, value])
  
  // 5. Early returns
  if (!data) return <LoadingState />
  if (error) return <ErrorState error={error} />
  
  // 6. Render
  return (
    <motion.div
      variants={getAccessibleVariants(animationVariants)}
      initial="initial"
      animate="animate"
      className={`base-classes ${variant-classes} ${className}`}
    >
      {/* Component content */}
    </motion.div>
  )
}
```

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

### 2. Store Usage Pattern

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

### 1. API Client Pattern

```typescript
// Service class pattern
export class APIService {
  private client: AxiosInstance
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000
    })
    
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token, etc.
        return config
      },
      (error) => Promise.reject(error)
    )
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error))
    )
  }
  
  private handleError(error: AxiosError): APIError {
    // Transform error to consistent format
    return {
      status: error.response?.status || 0,
      message: error.response?.data?.message || error.message,
      code: error.code
    }
  }
  
  // API methods
  async getItems(filters?: ItemFilters): Promise<Item[]> {
    const params = this.buildParams(filters)
    const response = await this.client.get<ItemsResponse>(`/items?${params}`)
    return response.data.data
  }
  
  async createItem(item: CreateItemRequest): Promise<Item> {
    const response = await this.client.post<ItemResponse>('/items', item)
    return response.data.data
  }
  
  private buildParams(filters?: Record<string, any>): string {
    if (!filters) return ''
    
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    
    return params.toString()
  }
}

// Export singleton
export const apiService = new APIService()
```

### 2. API Hook Pattern

```typescript
// Custom hook for API operations
export function useItems(filters?: ItemFilters) {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await apiService.getItems(filters)
      setItems(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [filters])
  
  const createItem = useCallback(async (item: CreateItemRequest) => {
    try {
      const newItem = await apiService.createItem(item)
      setItems(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }, [])
  
  useEffect(() => {
    loadItems()
  }, [loadItems])
  
  return {
    items,
    isLoading,
    error,
    loadItems,
    createItem,
    clearError: () => setError(null)
  }
}
```

## 🎭 Animation Patterns

### 1. Component Animation Pattern

```typescript
import { motion } from 'motion/react'
import { getAccessibleVariants, cardAnimationVariants } from '@/lib/mobile-animations'

export default function AnimatedComponent({ children }: Props) {
  return (
    <motion.div
      variants={getAccessibleVariants(cardAnimationVariants)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      whileTap="tap"
    >
      {children}
    </motion.div>
  )
}
```

### 2. List Animation Pattern

```typescript
import { motion, AnimatePresence } from 'motion/react'

export default function AnimatedList({ items }: { items: Item[] }) {
  return (
    <div>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <ItemComponent item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

### 3. Page Transition Pattern

```typescript
// In layout component
export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

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

These patterns provide a solid foundation for consistent, maintainable, and scalable code throughout the Gyan Pravah application. Always refer to these patterns when implementing new features or refactoring existing code.