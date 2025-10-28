# Implementation Plan

**Important Notes:**
- This project follows a monorepo structure with shared types in `@gyan-pravah/types`
- Always use shared types from `packages/types/src` instead of creating local types
- The app is online-only - no offline functionality or fallback data
- Use existing `instrumentation-client.ts` for PostHog initialization
- Follow Tailwind CSS v4 configuration and usage patterns

- [x] 1. Set up Next.js 16 project structure and dependencies





  - Initialize Next.js 16 project with App Router
  - Install and configure motion.dev, Zustand, Tailwind CSS, Lottie React, and PostHog
  - Set up Poppins font integration with Google Fonts
  - Configure Tailwind with cartoony flat color palette and mobile-first breakpoints
  - _Requirements: 6.3, 6.4, 5.2, 5.3_

- [x] 2. Create Zustand stores for state management





  - Implement quiz state store with current question, answers, score, and timer
  - Create user preferences store with localStorage persistence
  - Add expert mode and first-visit tracking functionality
  - _Requirements: 1.4, 2.5, 2.6, 7.2_

- [x] 3. Set up Strapi integration and data models
  - Configure Strapi client with proper error handling using shared types from @gyan-pravah/types
  - Implement API functions for fetching quiz data by topic and difficulty (online-only)
  - Create NoInternetConnection component for offline scenarios
  - Remove offline fallback functionality - app requires internet connection
  - _Requirements: 6.4, 7.1_

- [x] 4. Build core UI components with motion.dev animations





  - Create animated Button component with hover and tap effects
  - Implement Card component for quiz containers
  - Build Timer component with countdown animation
  - Create ProgressBar component for quiz progression
  - _Requirements: 3.4, 5.1, 5.4, 10.1_

- [x] 5. Implement quiz game components









  - Build QuestionCard component with enter/exit animations
  - Create AnswerOptions component with selection feedback animations
  - Implement question progression logic with motion.dev transitions
  - Add timer functionality with bonus points calculation
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 6. Create home page with topic selection





  - Build PlayNowButton component for instant quiz start
  - Implement TopicSelector with subtopic and difficulty options
  - Create ExpertModeToggle component with localStorage persistence
  - Add first-visit detection and direct quiz entry
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 7. Implement quiz results and scoring system





  - Create ScoreDisplay component with animated score reveal
  - Build ResultsCard component showing answers, corrections, and explanations
  - Implement replay options with same quiz or expert mode toggle
  - Add beautiful animated results screen with motion.dev
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Add Lottie animations for enhanced visual feedback





  - Integrate success/failure Lottie animations for answer feedback
  - Add loading animations for quiz data fetching
  - Implement celebration animations for quiz completion
  - Create engaging transition animations between game states
  - _Requirements: 3.5, 10.1_

- [x] 9. Implement PostHog analytics tracking





  - Use existing instrumentation-client.ts for PostHog initialization
  - Add event tracking for quiz start, question answers, and completion
  - Track expert mode usage and topic selection patterns
  - Implement user journey analytics for major game decision points
  - _Requirements: 6.1, 6.2_

- [x] 10. Create responsive layouts and mobile optimization






  - Implement mobile-first responsive design for all components
  - Add touch-friendly gesture handling with motion.dev
  - Optimize animations for mobile performance
  - Ensure proper touch target sizes and accessibility
  - _Requirements: 5.1, 5.5, 12.1_

- [x] 11. Add page transitions and navigation




  - Implement AnimatePresence for smooth page transitions
  - Create navigation between home, quiz, and results pages
  - Add proper routing with Next.js App Router
  - Handle browser back/forward navigation gracefully
  - _Requirements: 10.1, 7.3_

- [x] 12. Implement error handling and loading states





  - Add error boundaries for component failures
  - Create loading skeletons with motion.dev animations
  - Implement retry mechanisms for failed API calls
  - Use NoInternetConnection component for network failures (no offline mode)
  - _Requirements: 7.1, 7.4_

- [ ]* 13. Add comprehensive testing suite
  - Write unit tests for Zustand stores and utility functions
  - Create component tests for quiz flow and animations
  - Add integration tests for complete quiz scenarios
  - Test responsive design across different screen sizes
  - _Requirements: 7.5_

- [ ]* 14. Performance optimization and bundle analysis
  - Optimize Lottie animation loading and caching
  - Implement code splitting for better performance
  - Add performance monitoring and metrics
  - Optimize motion.dev animations for 60fps on mobile
  - _Requirements: 7.5_