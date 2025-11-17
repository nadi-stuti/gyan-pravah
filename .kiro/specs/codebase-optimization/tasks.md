# Implementation Plan

**Important Notes:**
- Focus on simplification and leveraging Next.js 16 features
- Remove all unnecessary code and complexity
- Use server components by default, client components only when needed
- No testing implementation required
- Update documentation after all code changes are complete

## Tasks

- [x] 1. Create Server-Side Strapi Client





  - Create new `lib/strapi-server.ts` with fetch-based API calls
  - Implement caching strategies using Next.js revalidation
  - Add server-side functions for topics, subtopics, and questions
  - Remove dependency on axios for server-side calls
  - _Requirements: 4.1, 4.2, 5.1, 5.2_

- [x] 2. Remove Unnecessary Components and Files





  - Delete `components/animations/PageTransition.tsx`
  - Delete `components/ui/LoadingSkeleton.tsx`
  - Delete `components/ui/ErrorBoundary.tsx`
  - Delete `components/ui/RetryHandler.tsx`
  - Delete `components/ui/AsyncWrapper.tsx`
  - Delete `components/ui/EnhancedDataLoader.tsx`
  - Delete entire `components/examples` directory
  - Delete `components/layout/ClientLayout.tsx`
  - Delete `components/navigation/NavigationHandler.tsx`
  - Delete `components/navigation/QuizExitHandler.tsx`
  - Delete `components/quiz/EnhancedQuizLoader.tsx`
  - Delete `components/quiz/SwipeableQuestionCard.tsx`
  - _Requirements: 1.1, 1.2, 1.3, 6.1, 6.5_

- [x] 3. Remove Test Pages and Unused Routes





  - Delete `app/animation-test` directory
  - Delete `app/quiz-test` directory
  - Delete `app/test` directory
  - Delete `app/ui-test` directory
  - _Requirements: 6.4_

- [x] 4. Remove/Simplify Hooks





  - Delete `hooks/useErrorHandling.ts`
  - Delete `hooks/useLoadingState.ts`
  - _Requirements: 2.1, 2.2, 6.2_


- [x] 5. Remove/Simplify Library Files





  - Delete `lib/error-service.ts`
  - Delete `lib/api-client.ts`
  - Review and remove unused code from `lib/mobile-gestures.ts`
  - Review and remove unused code from `lib/mobile-animations.ts`
  - Keep `lib/strapi.ts` for now (will be replaced by server version)
  - Keep `lib/quiz-api.ts` for now (will be simplified)
  - _Requirements: 2.3, 6.3, 8.3_

- [x] 6. Simplify Zustand Stores





  - Remove `stores/useSubtopicStore.ts` entirely
  - Simplify `stores/useQuizStore.ts` - remove unused fields
  - Remove unused QuizSession type import
  - Remove unnecessary state tracking fields
  - Keep only essential game state and replay metadata
  - Simplify `stores/useUserPreferences.ts` - keep only isFirstVisit and expertModeEnabled
  - Remove soundEnabled, lastPlayedTopic, lastPlayedSubtopic, totalGamesPlayed, bestScore
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Convert Topic Selection to Server Component





  - Update `app/topics/page.tsx` to be a server component
  - Fetch topics server-side using new strapi-server client
  - Implement proper caching with revalidation
  - Pass data to client components only where needed
  - Remove client-side topic fetching logic
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [x] 8. Optimize Quiz Page with Server Components





  - Update quiz pages to fetch questions server-side
  - Pass questions to client QuizGame component
  - Implement proper caching for question data
  - Remove client-side question fetching
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [x] 9. Simplify Quiz Components





  - Simplify `components/quiz/QuizGameLogic.tsx`
  - Remove unnecessary abstractions from quiz components
  - Keep only essential interactive elements as client components
  - Remove complex animation logic
  - _Requirements: 1.4, 7.1, 7.2, 7.3_

- [x] 10. Implement Simple Error Handling





  - Create `app/error.tsx` with simple error display
  - Create `app/loading.tsx` with simple loading state
  - Create topic-specific error.tsx files where needed
  - Remove all complex error boundary logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 11. Clean Up Remaining Client-Side API Code





  - Update components to use server-fetched data
  - Remove remaining axios/client-side API calls
  - Simplify `lib/quiz-api.ts` or remove if not needed
  - Update imports throughout the codebase
  - _Requirements: 5.3, 5.4, 8.1, 8.2, 8.3_

- [x] 12. Optimize Component Structure





  - Review all components for server/client boundaries
  - Consolidate related components where appropriate
  - Remove wrapper components that add no value
  - Ensure proper use of 'use client' directive
  - _Requirements: 4.4, 7.1, 7.2, 7.3, 7.4_

- [ ] 13. Verify Core Functionality
  - Test quiz gameplay flow
  - Test scoring and results display
  - Test topic selection and navigation
  - Test expert mode functionality
  - Verify PostHog analytics still works
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 14. Update Documentation - Part 1 (Files 1-10)








  - Update `docs/guide/01-project-overview.md`
  - Update `docs/guide/02-nextjs-configuration.md`
  - Update `docs/guide/03-app-router-structure.md`
  - Update `docs/guide/04-component-architecture.md`
  - Update `docs/guide/05-ui-components.md`
  - Update `docs/guide/06-quiz-components.md`
  - Update `docs/guide/07-layout-components.md`
  - Update `docs/guide/08-state-management.md`
  - Update `docs/guide/09-api-integration.md`
  - Update `docs/guide/10-data-flow.md`
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 15. Update Documentation - Part 2 (Files 11-19 + README)





  - Update `docs/guide/11-quiz-system.md`
  - Update `docs/guide/12-scoring-system.md`
  - Update `docs/guide/13-navigation-system.md`
  - Update `docs/guide/14-animation-system.md`
  - Update `docs/guide/15-mobile-experience.md`
  - Update `docs/guide/16-development-guide.md`
  - Update `docs/guide/17-code-patterns.md`
  - Update `docs/guide/18-performance-optimization.md`
  - Update `docs/guide/19-troubleshooting.md`
  - Update `docs/guide/README.md`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
