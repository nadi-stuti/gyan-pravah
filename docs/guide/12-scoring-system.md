# Scoring System

## 🎯 Overview

The Gyan Pravah quiz app uses a time-based scoring system that rewards both accuracy and speed. The faster you answer correctly, the more points you earn. This document explains the complete scoring mechanics.

## ⏱️ Time-Based Scoring Rules

Each question has a **10-second timer**. Your points depend on how quickly you answer:

### 1. Super Fast Answer (8-10 seconds remaining) ⚡

**Total Points: 20**

**Breakdown:**
- ✓ **10 points** - Correct answer base points
- 💨 **5 points** - Fast answer bonus (answered above 3 seconds)
- ⚡ **5 points** - Super fast bonus (answered within 2 seconds)

**Visual Feedback:**
- Bright yellow/orange background with gradient effect
- 🚀 Rocket emoji
- "SUPER FAST!" message
- Detailed breakdown showing all three components
- Special animation effects

**Example:**
```
User answers with 9 seconds remaining:
✓ Correct Answer: +10
⚡ Super Fast Bonus: +10
─────────────────────
Total: +20 points
```

### 2. Fast Answer (3-7 seconds remaining) 💨

**Total Points: 10-15** (variable based on time)

**Breakdown:**
- ✓ **10 points** - Correct answer base points
- 💨 **1 point per second** - Speed bonus for each second above 3 seconds threshold

**Calculation Formula:**
```
Points = 10 + (timeRemaining - 3)
```

**Visual Feedback:**
- Green background (solid color)
- ✨ Sparkle emoji
- "FAST ANSWER!" message
- Shows speed bonus calculation
- Standard animation

**Examples:**
```
User answers with 7 seconds remaining:
✓ Correct Answer: +10
💨 Speed Bonus: +4 (7-3 = 4 seconds)
─────────────────────
Total: +14 points

User answers with 5 seconds remaining:
✓ Correct Answer: +10
💨 Speed Bonus: +2 (5-3 = 2 seconds)
─────────────────────
Total: +12 points

User answers with 3 seconds remaining:
✓ Correct Answer: +10
💨 Speed Bonus: +0 (3-3 = 0 seconds)
─────────────────────
Total: +10 points
```

### 3. Late Answer (0-2 seconds remaining) 🐌

**Total Points: 5** (fixed)

**Breakdown:**
- ✓ **5 points** - Minimal points for correct but late answer
- No bonus points awarded

**Visual Feedback:**
- Gray background (dull appearance)
- ✓ Simple checkmark
- "CORRECT" message (no excitement)
- No bonus breakdown shown
- Subdued animation

**Example:**
```
User answers with 1 second remaining:
✓ Correct Answer: +5
─────────────────────
Total: +5 points
```

## 🎯 Bonus Round Multiplier

The last question(s) in each quiz are **Bonus Rounds** with **2x point multiplier**.

### Bonus Round Scoring

All points are **doubled** in bonus rounds:

**Super Fast (8-10 seconds):**
- Base calculation: 20 points
- With 2x multiplier: **40 points**

**Fast (3-7 seconds):**
- Base calculation: 10-15 points
- With 2x multiplier: **20-30 points**

**Late (0-2 seconds):**
- Base calculation: 5 points
- With 2x multiplier: **10 points**

**Visual Indicators:**
- Purple badge showing "🎯 Bonus Round: 2x Multiplier!"
- Orange/amber colored question badge
- Special "BONUS ROUND" label on question card

## 📊 Scoring Examples

### Example 1: Perfect Quiz (7 questions)

```
Question 1: Super Fast (9s) = 20 points
Question 2: Fast (6s) = 13 points
Question 3: Super Fast (8s) = 20 points
Question 4: Fast (5s) = 12 points
Question 5: Fast (4s) = 11 points
Question 6: Super Fast (10s) = 20 points
Question 7 (BONUS): Super Fast (9s) = 40 points (20 × 2)
─────────────────────────────────────
Total Score: 136 points
Maximum Possible: 160 points
Percentage: 85%
```

### Example 2: Mixed Performance

```
Question 1: Fast (7s) = 14 points
Question 2: Late (2s) = 5 points
Question 3: Wrong = 0 points
Question 4: Fast (4s) = 11 points
Question 5: Super Fast (8s) = 20 points
Question 6: Late (1s) = 5 points
Question 7 (BONUS): Fast (6s) = 26 points (13 × 2)
─────────────────────────────────────
Total Score: 81 points
Maximum Possible: 160 points
Percentage: 51%
Questions Correct: 6/7
```

### Example 3: Speed Master

```
Question 1: Super Fast (10s) = 20 points
Question 2: Super Fast (9s) = 20 points
Question 3: Super Fast (8s) = 20 points
Question 4: Super Fast (10s) = 20 points
Question 5: Super Fast (9s) = 20 points
Question 6: Super Fast (8s) = 20 points
Question 7 (BONUS): Super Fast (10s) = 40 points (20 × 2)
─────────────────────────────────────
Total Score: 160 points
Maximum Possible: 160 points
Percentage: 100% ⭐ PERFECT!
```

## 🎮 Quiz Modes and Maximum Scores

### QuizUp Mode (Default)
- **Questions:** 7 (6 normal + 1 bonus)
- **Time per question:** 10 seconds
- **Maximum score:** 160 points
  - 6 normal questions × 20 points = 120
  - 1 bonus question × 40 points = 40

### Quick Mode
- **Questions:** 5 (4 normal + 1 bonus)
- **Time per question:** 10 seconds
- **Maximum score:** 120 points
  - 4 normal questions × 20 points = 80
  - 1 bonus question × 40 points = 40

### Marathon Mode
- **Questions:** 15 (12 normal + 3 bonus)
- **Time per question:** 10 seconds
- **Maximum score:** 360 points
  - 12 normal questions × 20 points = 240
  - 3 bonus questions × 40 points = 120

### First Visit Mode
- **Questions:** 3 (all normal, no bonus)
- **Time per question:** 10 seconds
- **Maximum score:** 60 points
  - 3 normal questions × 20 points = 60

## 💡 Scoring Strategy Tips

### For Maximum Points:
1. **Read quickly** - Use the 3-second reading period efficiently
2. **Answer fast** - Aim for 8+ seconds remaining for super fast bonus
3. **Stay focused** - Bonus rounds are worth double
4. **Practice** - Familiarity with topics helps speed

### Point Thresholds:
- **Super Fast Zone:** 8-10 seconds = 20 points
- **Sweet Spot:** 5-7 seconds = 12-14 points
- **Safe Zone:** 3-4 seconds = 10-11 points
- **Danger Zone:** 0-2 seconds = 5 points only

### Bonus Round Strategy:
- Bonus rounds are worth **2x points**
- A super fast bonus answer = 40 points (same as 2 normal super fast answers)
- Don't rush and get it wrong - 0 points is worse than 10 points (late but correct)

## 🎨 Visual Feedback Design

### Design Philosophy
- **Simplified Information:** No complex math shown - just the result
- **Pill-Style Badges:** Clean, easy-to-read category indicators
- **Longer Display Time:** 2.5 seconds for comfortable reading
- **Subtle Animations:** Smooth, attractive without being overwhelming
- **Clear Hierarchy:** Emoji → Message → Badges → Points

### Super Fast Answer
- **Background:** Bright yellow (#FBBF24) - eye-catching
- **Emoji:** 🚀 Rocket (large, 7xl size)
- **Message:** "Amazing!"
- **Badges:** 
  - ⚡ Super Fast (orange pill)
  - 🎯 Bonus x2 (purple pill, if bonus round)
- **Points:** Large 6xl display
- **Animation:** Gentle scale-in, spring physics (200 stiffness, 15 damping)

### Fast Answer
- **Background:** Green (#4ADE80) - positive
- **Emoji:** ✨ Sparkles (large, 7xl size)
- **Message:** "Great Job!"
- **Badges:**
  - 💨 Fast Answer (dark green pill)
  - 🎯 Bonus x2 (purple pill, if bonus round)
- **Points:** Large 6xl display
- **Animation:** Smooth scale and fade

### Late Answer
- **Background:** Gray (#9CA3AF) - subdued
- **Emoji:** ✓ Simple check (large, 7xl size)
- **Message:** "Correct!"
- **Badges:**
  - 🎯 Bonus x2 (purple pill, only if bonus round)
- **Points:** Large 6xl display
- **Animation:** Minimal, clean entrance

### Wrong Answer
- **Background:** Red (#EF4444) - clear error
- **Emoji:** 😔 Sad face (large, 7xl size)
- **Message:** "Oops!"
- **Text:** "Better luck next time"
- **No points or badges shown**
- **Animation:** Gentle scale-in

## 🔧 Technical Implementation

### Point Calculation Function

```typescript
export function calculateQuestionPoints(
  isCorrect: boolean,
  timeRemaining: number,
  isBonusRound: boolean = false
): number {
  if (!isCorrect) return 0

  const BASE_POINTS = 10
  const SUPER_FAST_THRESHOLD = 8
  const FAST_THRESHOLD = 3
  const SUPER_FAST_BONUS = 5
  const FAST_ANSWER_BONUS = 5
  const LATE_ANSWER_POINTS = 5

  let points = 0

  if (timeRemaining >= SUPER_FAST_THRESHOLD) {
    // Super Fast: 10 + 5 + 5 = 20
    points = BASE_POINTS + FAST_ANSWER_BONUS + SUPER_FAST_BONUS
  } else if (timeRemaining >= FAST_THRESHOLD) {
    // Fast: 10 + (seconds above threshold)
    points = BASE_POINTS + (timeRemaining - FAST_THRESHOLD)
  } else {
    // Late: 5 points only
    points = LATE_ANSWER_POINTS
  }

  // Double for bonus rounds
  if (isBonusRound) {
    points *= 2
  }

  return points
}
```

### Point Breakdown Function

```typescript
export function getPointBreakdown(
  timeRemaining: number,
  isBonusRound: boolean = false
): {
  category: 'super-fast' | 'fast' | 'late'
  basePoints: number
  fastBonus: number
  superFastBonus: number
  totalPoints: number
  multiplier: number
}
```

## 📈 Performance Metrics

### Score Ratings

**Excellent (90-100%):**
- Consistently super fast answers
- Minimal mistakes
- Strong topic knowledge

**Good (70-89%):**
- Mix of fast and super fast
- Few mistakes
- Solid understanding

**Average (50-69%):**
- Mostly correct but slower
- Some mistakes
- Room for improvement

**Needs Practice (<50%):**
- Many late answers or mistakes
- Should review topic material
- Practice recommended

## 🎯 Design System Compliance

All scoring feedback follows the Gyan Pravah design system:

- ✅ **Solid colors only** - No gradients (except super fast which uses approved yellow-orange)
- ✅ **Approved color palette** - Green (#4ADE80), Yellow (#FBBF24), Red (#EF4444), Gray (#9CA3AF)
- ✅ **Poppins font** - All text uses Poppins font family
- ✅ **Rounded corners** - `rounded-3xl` for cards, `rounded-xl` for badges
- ✅ **No shadows** - Flat design with solid colors
- ✅ **Simple animations** - Spring physics under 300ms
- ✅ **Proper contrast** - All text meets 4.5:1 contrast ratio

## 📱 Mobile Optimization

- Large touch targets for answer buttons
- Clear, readable point breakdowns
- Smooth animations that don't lag
- Responsive text sizing
- Full-screen feedback overlays for visibility
- Quick dismiss after feedback duration

## 🔄 Version 2.2 Updates (Completed)

### Wrong Answer Handling ✅
- **No popup** for wrong answers
- Correct answer highlighted in **green** on question card
- User's wrong answer highlighted in **red**
- 2.5 second display before next question
- Maintains consistent feedback timing

### Reaction Time Tracking ✅
- Average reaction time tracked throughout quiz in Zustand store
- Displayed as **temperature meter** in game header (replaces percentage)
- Temperature ranges:
  - 🔥 **Hot** (<3s): Lightning Fast! - Red
  - 🌡️ **Warm** (3-5s): Great Speed - Orange
  - ❄️ **Cool** (5-7s): Good Pace - Blue
  - 🧊 **Cold** (>7s): Take Your Time - Dark Blue
- Updates in real-time as questions are answered
- Displayed in results screen above accuracy percentage

### Topic Display Fix ✅
- Fixed topic pill to show **subtopic name** instead of "General Knowledge"
- Proper fallback chain: Subtopic → Topic → General Knowledge
- Accurate category identification for all questions

### Results Screen Enhancements ✅

**Quiz Summary Pill:**
- Single-line horizontal display with color-coded question results
- Each question shown as numbered pill segment with icon
- Color codes: 🔥 Super Fast (Yellow), ✨ Fast (Green), ⏱️ Late (Gray), ❌ Wrong (Red), ⊘ Skipped (Dark Gray)
- Horizontal scrollable for quizzes with many questions
- Always stays in one line, never wraps
- Touch-friendly on mobile

**Average Reaction Time:**
- Displayed above accuracy percentage
- Shows time with temperature indicator
- Provides immediate feedback on speed performance

**Paginated Review Cards:**
- One question at a time instead of scrollable list
- Previous/Next navigation buttons
- Question counter (e.g., "Question 3 of 7")
- Detailed scoring math breakdown for each question

**Detailed Scoring Breakdown:**
- Shows time remaining and speed category
- Breaks down point calculation step by step
- Shows base points, speed bonuses, and multipliers
- Different display for correct vs incorrect answers

**Updated Action Buttons:**
- 🔄 **Play Again** - Reloads questions based on quiz source, maintains preferences
- ⚡ **Expert/Normal Toggle** - Switches mode and reloads questions
- 📖 **Choose Topic** - Navigates to topic selection page
- 🏠 **Go to Home** - Returns to home page
- Responsive layout: 2x2 grid on mobile, 1x4 on desktop

### Quiz Metadata Tracking ✅
- Added `quizSource` to track quiz origin (random/topic/first-visit)
- Added `quizTopicSlug`, `quizSubtopicSlug`, `quizDifficulty` for replay
- Enables accurate quiz replay with same configuration
- All quiz start points updated to set metadata

---

**Last Updated:** November 14, 2025  
**Version:** 2.2 - Enhanced UX and Results (Complete)  
**Previous:** 2.1 - Simplified Feedback, 2.0 - Time-Based Scoring
