# Error Handling and Loading States System

This directory contains a comprehensive error handling and loading states system for the Gyan Pravah quiz application. The system provides consistent error handling, retry mechanisms, loading states, and user feedback across the entire application.

## Components Overview

### Error Handling Components

#### `ErrorBoundary`
React error boundary component that catches JavaScript errors in component trees.

```tsx
import { ErrorBoundary, QuizErrorBoundary } from '@/components/ui'

// Basic usage
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Specialized for quiz components
<QuizErrorBoundary>
  <QuizComponent />
</QuizErrorBoundary>
```

#### `RetryHandler`
Component for handling failed operations with retry functionality.

```tsx
import { RetryHandler, NetworkRetryHandler } from '@/components/ui'

<RetryHandler
  onRetry={async () => await loadData()}
  error={error}
  maxRetries={3}
  retryDelay={1000}
/>
```

### Loading Components

#### `LoadingScreen`
Full-screen loading component with Lottie animations.

```tsx
import { LoadingScreen, QuizLoadingScreen } from '@/components/ui'

<LoadingScreen 
  message="Loading quiz..."
  submessage="Please wait while we prepare your questions"
/>
```

#### `LoadingSkeleton`
Skeleton loading components for different UI elements.

```tsx
import { 
  LoadingSkeleton, 
  QuestionCardSkeleton, 
  TopicCardSkeleton 
} from '@/components/ui'

// Basic skeleton
<LoadingSkeleton width="100%" height={48} />

// Specialized skeletons
<QuestionCardSkeleton />
<TopicCardSkeleton />
```

### Async Wrapper Components

#### `AsyncWrapper`
Comprehensive wrapper that handles loading, error, and success states.

```tsx
import { AsyncWrapper, QuizAsyncWrapper } from '@/components/ui'

<AsyncWrapper
  isLoading={isLoading}
  error={error}
  onRetry={handleRetry}
  showSkeleton={true}
  skeletonComponent={<QuestionCardSkeleton />}
>
  <YourContent />
</AsyncWrapper>
```

### Data Loaders

#### `EnhancedDataLoader`
High-level component for loading quiz data with comprehensive error handling.

```tsx
import { TopicsDataLoader, SubtopicsDataLoader } from '@/components/ui'

<TopicsDataLoader>
  {({ topics, isLoading, error, retry }) => (
    <div>
      {topics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
    </div>
  )}
</TopicsDataLoader>
```

## Hooks

### `useErrorHandling`
Hook for managing error states and retry logic.

```tsx
import { useErrorHandling, useQuizErrorHandling } from '@/components/ui'

const { 
  error, 
  isLoading, 
  execute, 
  retry, 
  canRetry, 
  errorMessage 
} = useErrorHandling({
  maxRetries: 3,
  retryDelay: 2000,
  onError: (error) => console.error('Error:', error)
})

// Execute async operation
const loadData = async () => {
  await execute(async () => {
    const data = await apiClient.getData()
    return data
  })
}
```

### `useLoadingState`
Hook for managing loading states with progress tracking.

```tsx
import { useLoadingState, useQuizLoading } from '@/components/ui'

const {
  isLoading,
  loadingMessage,
  progress,
  startLoading,
  stopLoading,
  updateProgress,
  updateMessage
} = useLoadingState({
  initialMessage: 'Loading...',
  minLoadingTime: 500,
  timeout: 30000
})

// Usage
const loadData = async () => {
  startLoading('Fetching data...')
  updateProgress(25, 'Connecting to server...')
  // ... load data
  updateProgress(75, 'Processing results...')
  await stopLoading()
}
```

## Services

### `errorService`
Centralized error logging and management service.

```tsx
import { logError, getUserFriendlyMessage, isCriticalError } from '@/components/ui'

try {
  await riskyOperation()
} catch (error) {
  logError(error, 'RiskyOperation')
  
  const message = getUserFriendlyMessage(error)
  const isCritical = isCriticalError(error)
  
  // Handle error appropriately
}
```

### `apiClient`
Enhanced API client with built-in retry logic and error handling.

```tsx
import { apiClient, checkConnectionStatus } from '@/components/ui'

// Check connection before making requests
const status = await checkConnectionStatus()
if (!status.isOnline) {
  // Handle offline state
}

// Make API calls with automatic retry
const questions = await apiClient.getQuestions({ topic: 'math' })
```

## Usage Patterns

### 1. Simple Data Loading with Error Handling

```tsx
function MyComponent() {
  const { error, isLoading, execute } = useErrorHandling()
  const [data, setData] = useState(null)

  useEffect(() => {
    execute(async () => {
      const result = await apiClient.getData()
      setData(result)
    })
  }, [])

  return (
    <AsyncWrapper isLoading={isLoading} error={error} onRetry={() => execute(loadData)}>
      <div>{data && <DataDisplay data={data} />}</div>
    </AsyncWrapper>
  )
}
```

### 2. Quiz Loading with Progress Tracking

```tsx
function QuizLoader({ onReady }) {
  const { isLoading, startLoading, stopLoading, updateProgress } = useQuizLoading()
  const { error, execute } = useQuizErrorHandling()

  const loadQuiz = async () => {
    startLoading('Preparing quiz...')
    
    updateProgress(25, 'Loading questions...')
    const questions = await apiClient.getQuestions()
    
    updateProgress(75, 'Setting up game...')
    // Setup game logic
    
    updateProgress(100, 'Ready!')
    await stopLoading()
    
    onReady(questions)
  }

  return (
    <QuizAsyncWrapper isLoading={isLoading} error={error} onRetry={() => execute(loadQuiz)}>
      <QuizGame />
    </QuizAsyncWrapper>
  )
}
```

### 3. Network-Aware Component

```tsx
function NetworkAwareComponent() {
  const [connectionStatus, setConnectionStatus] = useState(null)
  
  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkConnectionStatus()
      setConnectionStatus(status)
    }
    
    checkConnection()
  }, [])

  if (connectionStatus && !connectionStatus.isOnline) {
    return <NoInternetConnection onRetry={checkConnection} />
  }

  return <YourComponent />
}
```

## Design System Compliance

All components follow the Gyan Pravah design system rules:

- ✅ No gradients - uses solid colors only
- ✅ Approved color palette (`#8B7FC8`, `#6B5FA8`, etc.)
- ✅ Poppins font family
- ✅ Flat design with rounded corners
- ✅ Consistent spacing and animations
- ✅ Mobile-first responsive design

## Error Types

The system handles different types of errors:

- **Network Errors**: No internet connection
- **Timeout Errors**: Request took too long
- **Server Errors**: API server issues (5xx)
- **Client Errors**: Bad requests (4xx)
- **Component Errors**: JavaScript runtime errors

## Best Practices

1. **Always wrap data-loading components in error boundaries**
2. **Use specialized hooks for different contexts** (quiz, data, network)
3. **Provide meaningful error messages and retry options**
4. **Show loading skeletons for better perceived performance**
5. **Log errors for debugging and analytics**
6. **Handle offline scenarios gracefully**
7. **Use minimum loading times to prevent flashing**
8. **Implement progressive loading with progress indicators**

## Testing

The error handling system includes comprehensive error scenarios:

- Network connectivity issues
- API server failures
- Timeout conditions
- Component crashes
- Invalid data responses
- Authentication failures

Each component can be tested in isolation with mock errors and loading states.