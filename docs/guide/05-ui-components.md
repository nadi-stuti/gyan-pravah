# UI Components Library

## 🎨 Design System Components

The Gyan Pravah UI component library provides a comprehensive set of reusable components that follow the design system rules and ensure consistency across the application.

## 🏗️ Component Architecture

### Design System Principles

**Core Rules:**
- **No gradients** - Only solid colors from approved palette
- **Flat design** - Clean, simple aesthetics without shadows
- **Mobile-first** - Touch-friendly with proper sizing
- **Accessibility** - WCAG compliant with proper ARIA attributes
- **Performance** - Optimized animations and rendering

**Color Palette:**
```typescript
const DESIGN_COLORS = {
  primary: '#8B7FC8',      // Primary purple
  primaryDark: '#6B5FA8',  // Dark purple
  primaryLight: '#B4A5E8', // Light purple
  success: '#4ADE80',      // Green
  error: '#F87171',        // Red
  warning: '#FBBF24',      // Yellow
  neutral: '#D1D5DB',      // Gray
  white: '#FFFFFF'         // White
}
```

## 🔘 Button Component

The Button component is the foundation of all interactive elements.

### Interface and Props

```typescript
interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}
```

### Variant System

```typescript
const variantClasses = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600',
  secondary: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
  success: 'bg-success-500 text-white hover:bg-success-600',
  warning: 'bg-warning-500 text-white hover:bg-warning-600',
  danger: 'bg-danger-500 text-white hover:bg-danger-600',
  outline: 'bg-transparent border-2 border-primary-500 text-primary-500'
}
```

### Size System

```typescript
const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-touch',        // 44px minimum
  md: 'px-4 py-3 text-base min-h-touch-lg',   // 48px minimum
  lg: 'px-6 py-4 text-lg min-h-touch-lg'      // 52px minimum
}
```

### Usage Examples

```typescript
// Basic usage
<Button onClick={handleClick}>
  Click me
</Button>

// Primary action button
<Button variant="primary" size="lg" fullWidth>
  Start Quiz
</Button>

// Loading state
<Button isLoading disabled>
  Processing...
</Button>

// Success action
<Button variant="success" onClick={handleSubmit}>
  Submit Answer
</Button>

// Outline style
<Button variant="outline" size="sm">
  Cancel
</Button>
```

### Mobile Optimizations

```typescript
// Touch-friendly interactions
<motion.button
  variants={getAccessibleVariants(buttonAnimationVariants)}
  whileHover={!disabled ? "hover" : undefined}
  whileTap={!disabled ? "tap" : undefined}
  onClick={onClick ? () => handleTouchPress(onClick) : undefined}
  className="touch-manipulation" // Improves touch responsiveness
>
```

**Key Features:**
- **Touch optimization** - Uses `handleTouchPress` for better mobile experience
- **Loading states** - Built-in spinner animation
- **Accessibility** - Proper ARIA attributes and keyboard navigation
- **Animation** - Smooth hover and tap feedback
- **Responsive** - Adapts to different screen sizes

## 📄 Card Component

The Card component provides consistent container styling throughout the application.

### Interface and Props

```typescript
interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  animate?: boolean
  onClick?: () => void
  hoverable?: boolean
}
```

### Variant System

```typescript
const variantClasses = {
  default: 'shadow-card',           // Subtle shadow
  elevated: 'shadow-card-hover',    // More prominent shadow
  outlined: 'border-2 border-neutral-200 shadow-none' // Border only
}
```

### Padding System

```typescript
const paddingClasses = {
  none: '',
  sm: 'p-3 sm:p-4',     // Small padding
  md: 'p-4 sm:p-6',     // Medium padding (default)
  lg: 'p-6 sm:p-8'      // Large padding
}
```

### Usage Examples

```typescript
// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Interactive card
<Card onClick={handleCardClick} hoverable>
  <TopicContent />
</Card>

// Outlined card with custom padding
<Card variant="outlined" padding="lg">
  <QuestionContent />
</Card>

// No animation for performance
<Card animate={false}>
  <StaticContent />
</Card>
```

### Design System Compliance

```typescript
// ✅ CORRECT - Flat design with solid colors
const baseClasses = 'bg-background-card rounded-2xl font-poppins'

// ❌ WRONG - Would use gradients or complex shadows
// className="bg-gradient-to-r from-white to-gray-100 shadow-2xl"
```

## 🔄 Loading States

### Simple Loading with loading.tsx

Next.js provides built-in loading states:

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7FC8] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
```

### Component-Level Loading

```typescript
// Simple loading state in components
{isLoading && (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7FC8]"></div>
  </div>
)}
```

## 🚨 Error Handling

### Simple Error Handling with error.tsx

Next.js provides built-in error handling:

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

### Component-Level Error Handling

```typescript
// Simple error state in components
{error && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
    <p className="text-red-800">{error}</p>
    <button onClick={retry} className="mt-2 text-red-600 underline">
      Retry
    </button>
  </div>
)}
```

## 🎭 Animation Integration

### Mobile-Optimized Animations

```typescript
// All components use mobile-optimized animations
import { getAccessibleVariants, cardAnimationVariants } from '@/lib/mobile-animations'

<motion.div
  variants={getAccessibleVariants(cardAnimationVariants)}
  initial="initial"
  animate="animate"
  exit="exit"
>
```

### Accessibility Considerations

```typescript
// Respects user's motion preferences
export const getAccessibleVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  }
  
  return variants
}
```

### Performance Optimizations

```typescript
// GPU-accelerated animations
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
```

## 🎯 Component Usage Patterns

### Composition Pattern

```typescript
// Compose components for complex UI
<Card variant="outlined" padding="lg">
  <div className="space-y-4">
    <h2 className="text-xl font-bold">Quiz Results</h2>
    
    <div className="grid grid-cols-2 gap-4">
      <Button variant="success" fullWidth>
        Play Again
      </Button>
      <Button variant="outline" fullWidth>
        Return Home
      </Button>
    </div>
  </div>
</Card>
```

### Conditional Rendering Pattern

```typescript
// Handle different states
const QuizInterface = () => {
  if (isLoading) return <QuizLoadingScreen />
  if (error) return <ErrorBoundary><QuizError /></ErrorBoundary>
  
  return (
    <Card>
      <QuizContent />
      <div className="flex gap-4 mt-6">
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  )
}
```

### Responsive Design Pattern

```typescript
// Mobile-first responsive components
<div className="
  grid grid-cols-1 gap-3        // Mobile: single column
  sm:grid-cols-2 sm:gap-4       // Small: two columns
  lg:grid-cols-3 lg:gap-6       // Large: three columns
">
  {items.map(item => (
    <Card key={item.id} hoverable>
      <ItemContent item={item} />
    </Card>
  ))}
</div>
```

## 🔧 Customization and Extension

### Extending Components

```typescript
// Create specialized components by extending base components
interface QuizButtonProps extends ButtonProps {
  questionType?: 'normal' | 'bonus'
}

const QuizButton = ({ questionType, ...props }: QuizButtonProps) => {
  const variant = questionType === 'bonus' ? 'warning' : 'primary'
  
  return (
    <Button
      {...props}
      variant={variant}
      className={`quiz-button ${props.className || ''}`}
    />
  )
}
```

### Theme Customization

```typescript
// Customize component themes
const customButtonTheme = {
  primary: 'bg-[#8B7FC8] text-white hover:bg-[#6B5FA8]',
  success: 'bg-green-400 text-white hover:bg-green-500',
  // ... other variants
}

const ThemedButton = ({ variant, ...props }: ButtonProps) => {
  return (
    <Button
      {...props}
      className={`${customButtonTheme[variant]} ${props.className || ''}`}
    />
  )
}
```

## 📱 Mobile-Specific Features

### Touch Optimization

```typescript
// All interactive components use touch optimization
import { handleTouchPress } from '@/lib/mobile-gestures'

<button onClick={() => handleTouchPress(handleClick)}>
  // Provides haptic feedback and optimized touch handling
</button>
```

### Responsive Sizing

```typescript
// Components adapt to screen size
const responsiveClasses = {
  padding: 'p-3 sm:p-4 md:p-6',
  text: 'text-sm sm:text-base md:text-lg',
  spacing: 'space-y-3 sm:space-y-4 md:space-y-6'
}
```

### Performance Considerations

```typescript
// Lazy loading for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

<Suspense fallback={<LoadingScreen />}>
  <HeavyComponent />
</Suspense>
```

## 🧪 Testing Components

### Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Test Button')
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('shows loading state', () => {
    render(<Button isLoading>Loading Button</Button>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

## 📚 Component Library Benefits

### Consistency
- **Unified design language** across the application
- **Standardized interactions** and behaviors
- **Consistent spacing and typography**

### Maintainability
- **Single source of truth** for component logic
- **Easy to update** design system changes
- **Reusable patterns** reduce code duplication

### Performance
- **Optimized animations** for mobile devices
- **Efficient rendering** with proper memoization
- **Bundle size optimization** through tree shaking

### Accessibility
- **WCAG compliance** built into components
- **Keyboard navigation** support
- **Screen reader compatibility**

### Developer Experience
- **TypeScript support** with full type safety
- **Clear documentation** and examples
- **Consistent API** across all components

This UI component library provides the foundation for building consistent, accessible, and performant user interfaces in the Gyan Pravah application while maintaining strict adherence to the design system principles.