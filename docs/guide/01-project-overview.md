# Project Overview

## 🎯 What is Gyan Pravah?

Gyan Pravah is a **mobile-first quiz application** built with Next.js 16 that focuses on Indian cultural knowledge. The app provides an engaging, animated quiz experience with topics covering rivers (Nadi), scriptures (Shastras), texts (Granth), deities (Bhagvan), festivals (Utsav), holy places (Dham), and saints (Sant).

## 🏗️ Architecture Overview

### Technology Stack

**Frontend Framework:**
- **Next.js 16.0.0** with App Router (React 19.2.0)
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Motion** (Framer Motion) for animations

**State Management:**
- **Zustand** for minimal client-side state
- Server components for data fetching
- React hooks for local component state

**Backend Integration:**
- **Strapi CMS** as headless CMS
- **Next.js fetch** with caching for server-side data
- Server components for optimal performance

**Analytics & Monitoring:**
- **PostHog** for user analytics and tracking

**Development Tools:**
- **ESLint** for code linting
- **TypeScript** for type checking
- **Turbopack** for fast development builds

### Project Structure

```
app/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with font and metadata
│   ├── page.tsx           # Home page with first-visit logic
│   ├── globals.css        # Global styles and Tailwind
│   ├── error.tsx          # Global error handling
│   ├── loading.tsx        # Global loading state
│   ├── quiz/              # Quiz game page
│   ├── topics/            # Topic selection pages (server components)
│   └── results/           # Quiz results page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── quiz/             # Quiz-specific components
│   ├── topics/           # Topic display components
│   └── home/             # Home page components
├── lib/                  # Utilities and services
│   ├── strapi-server.ts  # Server-side Strapi client
│   ├── strapi.ts         # Client-side Strapi client (minimal)
│   └── analytics.ts      # PostHog analytics
├── stores/               # Zustand state stores (minimal)
│   ├── useQuizStore.ts   # Quiz game state only
│   └── useUserPreferences.ts # User settings only
└── public/               # Static assets
```

## 🎨 Design Philosophy

### Mobile-First Approach
- **Touch-optimized** interfaces with proper touch targets
- **Swipe gestures** for quiz navigation
- **Responsive design** that works on all screen sizes
- **Performance optimized** for mobile devices

### Cultural Design System
- **No gradients policy** - Only solid colors for clean aesthetics
- **Cultural color coding** - Each topic has its specific color
- **Flat design** - Clean, simple visual hierarchy
- **Poppins font** - Modern, readable typography

### User Experience Principles
- **Progressive disclosure** - Show information when needed
- **Immediate feedback** - Instant responses to user actions
- **Error resilience** - Graceful handling of network issues
- **Accessibility** - Proper contrast ratios and touch targets

## 🔄 Application Flow

### First-Time User Journey
1. **Landing** - User opens the app for the first time
2. **Auto-start** - App automatically starts a 7-question intro quiz
3. **Learning** - User experiences the quiz mechanics
4. **Completion** - User sees results and understands the app

### Returning User Journey
1. **Home Screen** - User sees play options and expert mode toggle
2. **Topic Selection** - User can choose specific topics or play random
3. **Quiz Game** - Interactive quiz with animations, scoring, and temperature meter
4. **Results** - Comprehensive results with:
   - Average reaction time display
   - Single-line quiz summary pill (color-coded performance)
   - Paginated review cards with detailed scoring breakdown
   - Four action buttons (Play Again, Mode Toggle, Choose Topic, Go Home)

### Expert Mode
- **Harder questions** - More challenging content
- **Extended quizzes** - Longer question sets
- **Advanced scoring** - More detailed performance metrics

## 🎯 Key Features

### Quiz System (v2.2)
- **Dynamic question loading** from Strapi CMS
- **Multiple difficulty levels** (easy, medium, hard)
- **Topic-based categorization** with cultural themes
- **Real-time scoring** with time-based bonuses
- **Reaction time tracking** with temperature meter display
- **Swipeable question cards** for mobile interaction
- **Wrong answer handling** - Shows correct/wrong answers on card (no popup)
- **Reading period** - 3 seconds to read before timer starts
- **Answer shuffling** - Prevents pattern memorization

### State Management
- **Minimal client state** - Only interactive quiz state
- **Server-side data fetching** - Topics and questions loaded on server
- **Persistent user preferences** - Expert mode and first visit flag
- **Quiz metadata tracking** - Stores source, topic, difficulty for replay
- **Reaction time tracking** - Average speed calculated in real-time

### Performance Optimizations
- **Turbopack** for fast development builds
- **Server components** for reduced JavaScript bundle
- **Next.js caching** with revalidation strategies
- **Image optimization** with Next.js Image component
- **Code splitting** with dynamic imports

### Analytics Integration
- **User behavior tracking** with PostHog
- **Quiz performance metrics** 
- **Error monitoring** and reporting
- **A/B testing capabilities** (ready for future use)

## 🚀 Why This Architecture?

### Next.js App Router Choice
- **File-based routing** - Intuitive page organization
- **Server components by default** - Better performance and SEO
- **Built-in optimizations** - Image, font, and bundle optimization
- **TypeScript integration** - Excellent developer experience
- **Native caching** - Fetch API with revalidation strategies

### Zustand for Minimal State
- **Lightweight** - Only for interactive client state
- **TypeScript-first** - Excellent type inference
- **Simple API** - Easy to understand and maintain
- **Persistence** - Built-in localStorage for preferences

### Strapi CMS Integration
- **Content management** - Non-technical users can manage questions
- **Server-side fetching** - Data loaded on server for performance
- **Next.js caching** - Automatic caching with revalidation
- **Scalability** - Can handle growing content needs

### Component Architecture
- **Server-first** - Server components by default
- **Client components** - Only for interactive elements
- **Separation of concerns** - Data fetching separated from UI
- **Type safety** - All components properly typed
- **Flat design** - Simple, maintainable component structure

## 📱 Mobile-First Considerations

### Touch Interactions
- **Minimum 44px touch targets** for accessibility
- **Swipe gestures** for natural mobile navigation
- **Haptic feedback** considerations (ready for implementation)
- **Thumb-friendly layouts** for one-handed use

### Performance
- **Server components** - Reduced JavaScript bundle size
- **Next.js caching** - Automatic caching with revalidation
- **Image optimization** - WebP format with fallbacks
- **Lazy loading** - Components and images load on demand

### Error Handling
- **Simple error.tsx files** - Next.js built-in error handling
- **Loading.tsx files** - Simple loading states
- **Graceful degradation** - Clear error messages
- **User-friendly feedback** - Retry options when appropriate

This architecture provides a solid foundation for a scalable, maintainable, and performant quiz application that delivers an excellent user experience on mobile devices while maintaining code quality and developer productivity.