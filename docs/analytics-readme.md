# PostHog Analytics Implementation

This document describes the comprehensive PostHog analytics implementation for the Quiz App.

## Overview

The analytics system tracks user interactions, quiz performance, and user journey patterns throughout the application. It uses PostHog for event tracking and user identification.

## Key Features

### 1. Type-Safe Event Tracking
- All analytics events are strongly typed using TypeScript interfaces
- Prevents tracking errors and ensures consistent event properties
- Located in `lib/analytics.ts`

### 2. User Journey Tracking
- **Topic Selection**: Tracks when users select topics and subtopics
- **Difficulty Selection**: Records difficulty choices and preferences
- **Expert Mode**: Monitors expert mode usage patterns
- **Play Now**: Tracks instant quiz starts

### 3. Quiz Performance Analytics
- **Question Answers**: Records answer selection, correctness, and timing
- **Question Timeouts**: Tracks when users don't answer in time
- **Quiz Completion**: Comprehensive completion metrics including score, percentage, and time taken
- **Performance Metrics**: Tracks user improvement over time

### 4. User Preferences Tracking
- **Expert Mode Toggles**: Tracks when and where users toggle expert mode
- **First Visit Handling**: Special tracking for first-time users
- **Replay Patterns**: Monitors how users replay quizzes

## Event Types

### Quiz Lifecycle Events
- `quiz_started`: When a quiz begins (with mode, topic, difficulty details)
- `question_answered`: Each question response with timing and correctness
- `question_timeout`: When questions time out without answers
- `quiz_completed`: Full quiz completion with comprehensive metrics

### User Journey Events
- `topic_selected`: Topic selection with available subtopics count
- `subtopic_selected`: Subtopic choice within topics
- `difficulty_selected`: Difficulty level selection
- `expert_mode_toggled`: Expert mode changes with context
- `play_now_clicked`: Instant quiz start button usage

### Results and Replay Events
- `results_viewed`: When users view their quiz results
- `replay_same_clicked`: Replaying with same settings
- `replay_expert_toggled`: Switching between normal/expert mode
- `return_home_clicked`: Returning to home from results

### Navigation and Error Events
- `page_viewed`: Page navigation tracking
- `quiz_error`: Error tracking with context and error details

## Implementation Details

### User Identification
- Generates consistent user IDs stored in localStorage
- Tracks user properties like preferences, best scores, and game counts
- Updates user properties when preferences change

### Privacy and Performance
- Graceful failure - analytics errors don't break the app
- Respects user opt-out preferences
- Only tracks when PostHog is properly initialized
- Includes environment detection (development vs production)

### Context-Rich Events
All events include:
- Timestamp
- User agent and screen dimensions
- Environment information
- Relevant quiz context (topic, difficulty, mode)

## Usage Examples

### Tracking a Quiz Start
```typescript
trackEvent('quiz_started', {
  mode: 'expert',
  topic: 'mathematics',
  subtopic: 'algebra',
  difficulty: 'Hard',
  total_questions: 5,
  is_expert_mode: true,
  is_first_visit: false
})
```

### Tracking Question Answers
```typescript
trackEvent('question_answered', {
  question_id: 123,
  question_number: 3,
  selected_answer: 'B',
  correct_answer: 'A',
  is_correct: false,
  time_taken: 12,
  time_remaining: 8,
  points_earned: 0,
  difficulty: 'Medium',
  topic: 'science',
  subtopic: 'physics'
})
```

## Integration Points

### Components with Analytics
- **PlayNowButton**: Tracks instant quiz starts
- **TopicSelector**: Tracks topic/subtopic/difficulty selection
- **ExpertModeToggle**: Tracks expert mode changes
- **QuizGameLogic**: Tracks question answers and timeouts
- **Results Page**: Tracks result viewing and replay actions
- **Home Page**: Tracks page views and first-visit handling

### Store Integration
- **UserPreferences Store**: Updates PostHog user properties when preferences change
- **Quiz Store**: Provides quiz state for analytics context

## Analytics Dashboard Insights

This implementation enables tracking of:

1. **User Engagement Patterns**
   - Most popular topics and difficulties
   - Expert mode adoption rates
   - Quiz completion rates

2. **Performance Metrics**
   - Average scores by topic/difficulty
   - Time-to-answer patterns
   - Question difficulty effectiveness

3. **User Journey Analysis**
   - Drop-off points in quiz flow
   - Replay behavior patterns
   - First-visit conversion rates

4. **Feature Usage**
   - Expert mode usage patterns
   - Topic selection preferences
   - Navigation patterns

## Error Handling

- All analytics calls are wrapped in try-catch blocks
- Errors are logged to console but don't break app functionality
- Graceful degradation when PostHog is unavailable
- Respects user privacy preferences

## Future Enhancements

Potential additions:
- A/B testing support
- Custom event funnels
- Real-time analytics dashboard
- User cohort analysis
- Performance optimization tracking