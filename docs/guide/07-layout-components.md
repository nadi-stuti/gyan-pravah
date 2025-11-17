# Layout Components

## 🏗️ Layout System Overview

The layout components in Gyan Pravah provide the structural foundation for the application, handling page transitions, mobile optimizations, navigation, and responsive design. These components ensure consistent user experience across all devices and screen sizes.

## 🎭 PHProvider Component (Simplified)

The PHProvider is a simple wrapper for PostHog analytics initialization.

### Core Functionality

```typescript
'use client'

import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false // We'll capture manually
      })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

**Simplified Features:**
- **Client component only** - Wraps app for analytics
- **Simple initialization** - PostHog setup on mount
- **No complex transitions** - Removed page transition logic
- **No navigation handling** - Simplified architecture

### Root Layout Integration

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <PHProvider>
          {children}
        </PHProvider>
      </body>
    </html>
  )
}
```

**Benefits:**
- **Minimal client JavaScript** - Only analytics provider
- **Simple structure** - Easy to understand
- **No complex state** - Just wraps children
- **Better performance** - Less overhead

## 📱 Mobile-First Design (No Special Component)

Mobile optimization is handled through responsive CSS and Tailwind classes, not a separate component.

### Responsive Layout Pattern

```typescript
// Standard responsive container pattern
<div className="
  min-h-screen 
  max-w-2xl mx-auto 
  px-3 sm:px-4 
  py-4 sm:py-6
">
  <Content />
</div>
```

**Mobile-First Features:**
- **Responsive padding** - Smaller on mobile, larger on desktop
- **Max width container** - Prevents content from being too wide
- **Tailwind breakpoints** - sm, md, lg for different screen sizes
- **No JavaScript needed** - Pure CSS solution

### Touch-Friendly Interactions

```typescript
// Touch-optimized button
<button className="
  min-h-[44px]           // Minimum touch target
  px-6 py-3              // Adequate padding
  rounded-xl             // Rounded corners
  touch-manipulation     // Optimized touch handling
">
  Click me
</button>
```

**Touch Optimizations:**
- **Minimum 44px height** - iOS accessibility guidelines
- **Adequate padding** - Easy to tap
- **touch-manipulation** - Better touch responsiveness
- **No complex JavaScript** - Simple CSS classes

## 🧭 Navigation (Simplified)

Navigation is handled through Next.js Link and router, no custom components needed.

### Simple Navigation Pattern

```typescript
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Using Link for navigation
<Link 
  href="/topics" 
  className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl"
>
  Browse Topics
</Link>

// Using router for programmatic navigation
const router = useRouter()
const handleClick = () => {
  router.push('/quiz')
}
```

### Back Navigation

```typescript
// Simple back button
'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.back()}
      className="p-3 rounded-xl bg-white text-[#8B7FC8]"
    >
      ← Back
    </button>
  )
}
```

**Simplified Approach:**
- **No custom components** - Use Next.js Link and router
- **No tracking in components** - Handle separately if needed
- **Simple onClick handlers** - Direct router calls
- **Less code to maintain** - Fewer abstractions

## 🎨 Layout Patterns (Simplified)

### Standard Page Layout

```typescript
// Simple responsive page layout
<div className="min-h-screen" style={{ backgroundColor: '#8B7FC8' }}>
  <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
    <Content />
  </div>
</div>
```

### Centered Content

```typescript
// Centered layout for home page
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <CenteredContent />
  </div>
</div>
```

**Simple Patterns:**
- **Consistent max-width** - 2xl (672px) for most pages
- **Responsive padding** - Smaller on mobile
- **Flexbox centering** - For home and error pages
- **No complex nesting** - Flat, simple structure

## 🎭 Animation Integration (Minimal)

### Simple Component Animations

```typescript
// Basic entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <Content />
</motion.div>
```

### Button Interactions

```typescript
// Simple hover and tap animations
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-[#8B7FC8] text-white px-6 py-3 rounded-xl"
>
  Click me
</motion.button>
```

**Minimal Animations:**
- **Simple entrance effects** - Fade and slide only
- **Basic interactions** - Scale on hover/tap
- **No complex orchestration** - Individual component animations
- **Better performance** - Less animation overhead

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

The simplified layout approach uses standard Next.js patterns, Tailwind CSS, and minimal custom components to provide a clean, maintainable, and performant foundation for the application.