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
- **Lottie React** for complex animations

**State Management:**
- **Zustand** for global state management
- React hooks for local component state

**Backend Integration:**
- **Strapi CMS** as headless CMS
- **Axios** for API communication
- Custom API client with error handling

**Analytics & Monitoring:**
- **PostHog** for user analytics and tracking
- Custom error service for error handling

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
│   ├── quiz/              # Quiz game page
│   ├── topics/            # Topic selection pages
│   └── results/           # Quiz results page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── quiz/             # Quiz-specific components
│   ├── home/             # Home page components
│   ├── layout/           # Layout components
│   └── navigation/       # Navigation components
├── lib/                  # Utilities and services
│   ├── strapi.ts         # Strapi API client
│   ├── analytics.ts      # PostHog analytics
│   ├── quiz-api.ts       # Quiz-specific API calls
│   └── error-service.ts  # Error handling service
├── stores/               # Zustand state stores
│   ├── useQuizStore.ts   # Quiz game state
│   ├── useSubtopicStore.ts # Topic availability
│   └── useUserPreferences.ts # User settings
├── hooks/                # Custom React hooks
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
2. **Auto-start** - App automatically starts a 3-question intro quiz
3. **Learning** - User experiences the quiz mechanics
4. **Completion** - User sees results and understands the app

### Returning User Journey
1. **Home Screen** - User sees play options and expert mode toggle
2. **Topic Selection** - User can choose specific topics or play random
3. **Quiz Game** - Interactive quiz with animations and scoring
4. **Results** - Detailed results with performance metrics

### Expert Mode
- **Harder questions** - More challenging content
- **Extended quizzes** - Longer question sets
- **Advanced scoring** - More detailed performance metrics

## 🎯 Key Features

### Quiz System
- **Dynamic question loading** from Strapi CMS
- **Multiple difficulty levels** (easy, medium, hard)
- **Topic-based categorization** with cultural themes
- **Real-time scoring** with immediate feedback
- **Swipeable question cards** for mobile interaction

### State Management
- **Persistent user preferences** across sessions
- **Quiz state management** with pause/resume capability
- **Topic availability caching** for offline-like experience
- **Error state handling** with retry mechanisms

### Performance Optimizations
- **Turbopack** for fast development builds
- **Image optimization** with Next.js Image component
- **Code splitting** with dynamic imports
- **Caching strategies** for API responses

### Analytics Integration
- **User behavior tracking** with PostHog
- **Quiz performance metrics** 
- **Error monitoring** and reporting
- **A/B testing capabilities** (ready for future use)

## 🚀 Why This Architecture?

### Next.js App Router Choice
- **File-based routing** - Intuitive page organization
- **Server components** - Better performance and SEO
- **Built-in optimizations** - Image, font, and bundle optimization
- **TypeScript integration** - Excellent developer experience

### Zustand for State Management
- **Lightweight** - Minimal boilerplate compared to Redux
- **TypeScript-first** - Excellent type inference
- **Devtools support** - Easy debugging
- **Persistence** - Built-in localStorage integration

### Strapi CMS Integration
- **Content management** - Non-technical users can manage questions
- **API flexibility** - RESTful API with custom endpoints
- **Media handling** - Image and file management
- **Scalability** - Can handle growing content needs

### Component Architecture
- **Atomic design** - Small, reusable components
- **Separation of concerns** - Logic separated from presentation
- **Type safety** - All components properly typed
- **Testing friendly** - Components designed for easy testing

## 📱 Mobile-First Considerations

### Touch Interactions
- **Minimum 44px touch targets** for accessibility
- **Swipe gestures** for natural mobile navigation
- **Haptic feedback** considerations (ready for implementation)
- **Thumb-friendly layouts** for one-handed use

### Performance
- **Bundle size optimization** - Only load what's needed
- **Image optimization** - WebP format with fallbacks
- **Lazy loading** - Components and images load on demand
- **Caching strategies** - Reduce network requests

### Offline Considerations
- **Service worker ready** - PWA capabilities with next-pwa
- **Local storage** - Critical data persisted locally
- **Error boundaries** - Graceful degradation when offline
- **Retry mechanisms** - Automatic retry for failed requests

This architecture provides a solid foundation for a scalable, maintainable, and performant quiz application that delivers an excellent user experience on mobile devices while maintaining code quality and developer productivity.