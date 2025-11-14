# Layout Components

## 🏗️ Layout System Overview

The layout components in Gyan Pravah provide the structural foundation for the application, handling page transitions, mobile optimizations, navigation, and responsive design. These components ensure consistent user experience across all devices and screen sizes.

## 🎭 ClientLayout Component

The ClientLayout component serves as the main wrapper for all pages, providing global functionality like analytics tracking, page transitions, and navigation handling.

### Core Functionality

```typescript
interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()

  // Global page view tracking
  useEffect(() => {
    const pageName = pathname === '/' ? 'home' : pathname.slice(1).split('/')[0]
    
    const validPages = ['home', 'quiz', 'results', 'topics', 'subtopics'] as const
    type ValidPage = typeof validPages[number]
    
    if (validPages.includes(pageName as ValidPage)) {
      trackPageView(pageName as ValidPage)
    }
  }, [pathname])

  return (
    <>
      <NavigationHandler />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={pathname} variants={pageVariants}>
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}
```

### Page Transition System

**Directional Transitions:**
```typescript
const getPageVariants = (pathname: string, previousPath?: string) => {
  // Determine navigation direction based on route hierarchy
  const routeOrder = ['/', '/topics', '/topics/subtopics', '/quiz', '/results']
  const currentIndex = routeOrder.findIndex(route => pathname.startsWith(route))
  const previousIndex = previousPath ? routeOrder.findIndex(route => previousPath.startsWith(route)) : -1
  
  const isBackward = currentIndex < previousIndex && previousIndex !== -1

  // Subtle directional animations
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
```

**Transition Configuration:**
```typescript
const pageTransition = {
  type: "tween" as const,
  ease: "easeOut" as const,
  duration: 0.15  // Fast, subtle transitions
}
```

**Key Features:**
- **Directional awareness** - Different animations for forward/backward navigation
- **Subtle movement** - Minimal displacement (3px) for smooth feel
- **Fast transitions** - 150ms duration for responsiveness
- **Accessibility** - Respects reduced motion preferences

### Global Analytics Integration

```typescript
// Automatic page view tracking
useEffect(() => {
  const pageName = pathname === '/' ? 'home' : pathname.slice(1).split('/')[0]
  
  if (validPages.includes(pageName as ValidPage)) {
    trackPageView(pageName as ValidPage)
  }
}, [pathname])
```

**Benefits:**
- **Automatic tracking** - No need to add tracking to each page
- **Consistent data** - Standardized page names across analytics
- **Performance** - Single tracking point reduces overhead
- **Maintainability** - Easy to modify tracking logic globally

## 📱 MobileLayout Component

Specialized layout component for mobile-specific optimizations and safe area handling.

### Interface and Features

```typescript
interface MobileLayoutProps {
  children: ReactNode
  className?: string
  enableSafeArea?: boolean
  preventZoom?: boolean
  optimizeScroll?: boolean
}
```

### Safe Area Implementation

```typescript
const safeAreaInsets = enableSafeArea ? getSafeAreaInsets() : { top: 0, bottom: 0, left: 0, right: 0 }

const layoutStyle = enableSafeArea ? {
  paddingTop: `max(1rem, ${safeAreaInsets.top}px)`,
  paddingBottom: `max(1rem, ${safeAreaInsets.bottom}px)`,
  paddingLeft: `max(0.75rem, ${safeAreaInsets.left}px)`,
  paddingRight: `max(0.75rem, ${safeAreaInsets.right}px)`,
} : {}
```

**Safe Area Benefits:**
- **Notch compatibility** - Works with iPhone X+ notches
- **Rounded corners** - Respects device corner radius
- **Home indicator** - Avoids iOS home indicator area
- **Flexible fallbacks** - Minimum padding when safe areas not available

### Mobile Optimizations

```typescript
useEffect(() => {
  const container = document.getElementById('mobile-layout-container')
  
  if (container) {
    // Prevent zoom on double tap
    if (preventZoom) {
      preventZoomOnDoubleTap(container)
    }
    
    // Optimize scroll behavior
    if (optimizeScroll) {
      optimizeScrollForMobile(container)
    }
  }
}, [preventZoom, optimizeScroll])
```

**Mobile Features:**
- **Zoom prevention** - Prevents accidental zoom on double-tap
- **Scroll optimization** - Momentum scrolling and overscroll behavior
- **Touch handling** - Optimized touch event processing
- **Performance** - GPU-accelerated scrolling where possible

### Usage Examples

```typescript
// Basic mobile layout
<MobileLayout>
  <QuizContent />
</MobileLayout>

// Full mobile optimization
<MobileLayout
  enableSafeArea={true}
  preventZoom={true}
  optimizeScroll={true}
  className="bg-gray-50"
>
  <GameInterface />
</MobileLayout>

// Custom safe area handling
<MobileLayout enableSafeArea={false} className="custom-padding">
  <CustomContent />
</MobileLayout>
```

## 🧭 Navigation Components

### BackButton Component

Provides consistent back navigation with analytics tracking and flexible routing.

```typescript
interface BackButtonProps {
  to?: string
  className?: string
  children?: React.ReactNode
  onBack?: () => void
}

export default function BackButton({ to, className, children, onBack }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Track navigation for analytics
    trackEvent('back_button_clicked', {
      from_page: window.location.pathname,
      to_page: to || 'browser_back'
    })

    if (onBack) {
      onBack()  // Custom handler
    } else if (to) {
      router.push(to)  // Specific route
    } else {
      router.back()  // Browser back
    }
  }

  return (
    <motion.button
      onClick={handleBack}
      className={`p-3 rounded-xl bg-white text-[#8B7FC8] shadow-md ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children || <BackArrowIcon />}
    </motion.button>
  )
}
```

**Usage Patterns:**
```typescript
// Default browser back
<BackButton />

// Specific route
<BackButton to="/topics" />

// Custom handler
<BackButton onBack={() => handleCustomBack()} />

// Custom styling and content
<BackButton className="bg-red-500" to="/home">
  <CustomIcon />
</BackButton>
```

### NavigationButton Component

Generic navigation button with tracking and animation support.

```typescript
interface NavigationButtonProps {
  to: string
  className?: string
  children: ReactNode
  onClick?: () => void
  trackingData?: Record<string, any>
  disabled?: boolean
}

export default function NavigationButton({ 
  to, 
  className, 
  children,
  onClick,
  trackingData = {},
  disabled = false
}: NavigationButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (disabled) return

    // Track with custom data
    trackEvent('navigation_button_clicked', {
      from_page: window.location.pathname,
      to_page: to,
      ...trackingData
    })

    if (onClick) {
      onClick()  // Pre-navigation logic
    }
    
    router.push(to)
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
```

**Usage Examples:**
```typescript
// Basic navigation
<NavigationButton to="/quiz">
  Start Quiz
</NavigationButton>

// With tracking data
<NavigationButton 
  to="/topics" 
  trackingData={{ source: 'home_page', action: 'browse_topics' }}
>
  Browse Topics
</NavigationButton>

// With pre-navigation logic
<NavigationButton 
  to="/quiz" 
  onClick={() => prepareQuiz()}
  disabled={!isReady}
>
  Continue Quiz
</NavigationButton>
```

## 🎨 Layout Patterns

### Responsive Container Pattern

```typescript
// Standard responsive container
<div className="
  w-full max-w-sm mx-auto px-3 py-6    // Mobile
  sm:max-w-md sm:px-4 sm:py-8          // Small screens
  md:max-w-lg md:px-6 md:py-10         // Medium screens
  lg:max-w-xl lg:px-8 lg:py-12         // Large screens
">
  <Content />
</div>
```

### Centered Layout Pattern

```typescript
// Full-height centered layout
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <CenteredContent />
  </div>
</div>
```

### Header-Content-Footer Pattern

```typescript
// Structured page layout
<div className="min-h-screen flex flex-col">
  <header className="flex-shrink-0">
    <PageHeader />
  </header>
  
  <main className="flex-1 flex flex-col">
    <MainContent />
  </main>
  
  <footer className="flex-shrink-0">
    <PageFooter />
  </footer>
</div>
```

## 🎭 Animation Integration

### Layout Animations

```typescript
// Smooth layout transitions
<motion.div
  layout
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  <DynamicContent />
</motion.div>
```

### Staggered Children

```typescript
// Staggered entrance animations
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }}
>
  {items.map(item => (
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
```

### Conditional Animations

```typescript
// Animate based on conditions
<motion.div
  animate={{
    scale: isActive ? 1.05 : 1,
    opacity: isVisible ? 1 : 0.5
  }}
  transition={{ duration: 0.2 }}
>
  <ConditionalContent />
</motion.div>
```

## 📱 Mobile-Specific Layouts

### Touch-Optimized Layout

```typescript
// Touch-friendly spacing and sizing
<div className="
  space-y-4 p-4                    // Mobile spacing
  sm:space-y-6 sm:p-6             // Larger screens
">
  <button className="
    min-h-touch-lg w-full           // 48px minimum height
    p-4 rounded-xl                  // Adequate padding
    text-base font-medium           // Readable text
  ">
    Touch-Friendly Button
  </button>
</div>
```

### Swipe-Enabled Layout

```typescript
// Layout supporting swipe gestures
<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  onDragEnd={(event, info) => {
    if (info.offset.x > 50) {
      handleSwipeRight()
    } else if (info.offset.x < -50) {
      handleSwipeLeft()
    }
  }}
>
  <SwipeableContent />
</motion.div>
```

### Bottom Sheet Layout

```typescript
// Mobile bottom sheet pattern
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30 }}
      className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-6 shadow-2xl"
    >
      <BottomSheetContent />
    </motion.div>
  )}
</AnimatePresence>
```

## 🔧 Layout Utilities

### Safe Area Utilities

```typescript
// CSS custom properties for safe areas
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
  --safe-area-inset-right: env(safe-area-inset-right);
}

// Tailwind utilities
.safe-top { padding-top: max(1rem, var(--safe-area-inset-top)); }
.safe-bottom { padding-bottom: max(1rem, var(--safe-area-inset-bottom)); }
```

### Responsive Utilities

```typescript
// Breakpoint utilities
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
}

// Media query hook
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    
    const listener = () => setMatches(media.matches)
    media.addListener(listener)
    
    return () => media.removeListener(listener)
  }, [query])
  
  return matches
}
```

## 🎯 Performance Considerations

### Layout Optimization

```typescript
// Avoid layout thrashing
// ❌ Bad - causes layout recalculation
style={{ width: `${percentage}%`, height: 'auto' }}

// ✅ Good - uses transform (GPU accelerated)
style={{ transform: `scaleX(${percentage / 100})` }}
```

### Efficient Re-renders

```typescript
// Memoize layout components
const MemoizedLayout = memo(({ children, className }: LayoutProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
})

// Use layout effect for DOM measurements
useLayoutEffect(() => {
  const rect = elementRef.current?.getBoundingClientRect()
  if (rect) {
    setDimensions({ width: rect.width, height: rect.height })
  }
}, [])
```

### Virtual Scrolling

```typescript
// For large lists
import { FixedSizeList as List } from 'react-window'

<List
  height={600}
  itemCount={items.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ItemComponent item={items[index]} />
    </div>
  )}
</List>
```

## 🧪 Testing Layout Components

### Layout Testing

```typescript
describe('ClientLayout', () => {
  it('tracks page views on route change', () => {
    const mockTrackPageView = jest.fn()
    jest.mock('@/lib/analytics', () => ({ trackPageView: mockTrackPageView }))
    
    render(<ClientLayout><div>Test</div></ClientLayout>)
    
    expect(mockTrackPageView).toHaveBeenCalledWith('home')
  })
  
  it('applies correct page transitions', () => {
    const { rerender } = render(<ClientLayout><div>Page 1</div></ClientLayout>)
    
    rerender(<ClientLayout><div>Page 2</div></ClientLayout>)
    
    expect(screen.getByText('Page 2')).toHaveClass('motion-div')
  })
})
```

### Mobile Layout Testing

```typescript
describe('MobileLayout', () => {
  it('applies safe area insets', () => {
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        getPropertyValue: (prop: string) => {
          if (prop === 'env(safe-area-inset-top)') return '44px'
          return '0px'
        }
      })
    })
    
    render(<MobileLayout enableSafeArea><div>Content</div></MobileLayout>)
    
    const container = screen.getByText('Content').parentElement
    expect(container).toHaveStyle('padding-top: max(1rem, 44px)')
  })
})
```

The layout components provide a solid foundation for building consistent, responsive, and mobile-optimized user interfaces while maintaining excellent performance and accessibility standards.