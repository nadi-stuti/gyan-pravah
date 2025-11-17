# Gyan Pravah Leaderboard System - Complete Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Strapi Schema Design](#strapi-schema-design)
3. [API Endpoints](#api-endpoints)
4. [Next.js Integration](#nextjs-integration)
5. [UI/UX Design](#uiux-design)
6. [Implementation Steps](#implementation-steps)

---

## 🎯 Overview

### Leaderboard Types

**1. Standard Leaderboards (Score-based)**
- City-based rankings (All-time, Monthly, Weekly, Daily)
- Topic/Subtopic rankings with Expert Mode toggle
- Tie-breaker: Average reaction time (2 decimal precision)

**2. Mastery Leaderboard (Medal-based)**
- Topic mastery showing Gold/Silver/Bronze medals
- Gold: 1st place in a subtopic
- Silver: 2nd-5th place in a subtopic
- Bronze: 6th-10th place in a subtopic
- Sorted like Olympic medal tally

### Data Points
- Player name
- City/Location
- Score
- Topic & Subtopic
- Average reaction time (float, 2 decimals)
- Expert mode (boolean)
- Date created
- Ranking position

---

## 🗄️ Strapi Schema Design

### 1. Create Leaderboard Entry Collection

**File:** `cms/src/api/leaderboard-entry/content-types/leaderboard-entry/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "leaderboard_entries",
  "info": {
    "singularName": "leaderboard-entry",
    "pluralName": "leaderboard-entries",
    "displayName": "Leaderboard Entry",
    "description": "Player scores for leaderboards"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "playerName": {
      "type": "string",
      "required": true,
      "maxLength": 50
    },
    "city": {
      "type": "string",
      "required": true,
      "maxLength": 100
    },
    "score": {
      "type": "integer",
      "required": true,
      "min": 0
    },
    "avgReactionTime": {
      "type": "decimal",
      "required": true,
      "min": 0,
      "default": 0.00
    },
    "isExpertMode": {
      "type": "boolean",
      "default": false
    },
    "quiz_topic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::quiz-topic.quiz-topic"
    },
    "quiz_subtopic": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::quiz-subtopic.quiz-subtopic"
    },
    "topicSlug": {
      "type": "string",
      "required": true
    },
    "subtopicSlug": {
      "type": "string",
      "required": true
    },
    "questionsAnswered": {
      "type": "integer",
      "default": 0
    },
    "correctAnswers": {
      "type": "integer",
      "default": 0
    }
  }
}
```

### 2. Create City Collection (Optional but Recommended)

**File:** `cms/src/api/city/content-types/city/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "cities",
  "info": {
    "singularName": "city",
    "pluralName": "cities",
    "displayName": "City"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name"
    },
    "state": {
      "type": "string"
    },
    "country": {
      "type": "string",
      "default": "India"
    }
  }
}
```

**Benefits:**
- Standardized city names
- Prevents typos and duplicates
- Easy filtering and grouping
- Can add state/country for future expansion

---

## 🔌 API Endpoints

### Strapi Custom Controller

**File:** `cms/src/api/leaderboard-entry/controllers/leaderboard-entry.ts`

```typescript
export default {
  // Get leaderboard with filters
  async find(ctx) {
    const { 
      city, 
      topicSlug, 
      subtopicSlug, 
      isExpertMode, 
      timeRange = 'all',
      limit = 100 
    } = ctx.query;

    const filters: any = {};
    
    if (city) filters.city = { $eq: city };
    if (topicSlug) filters.topicSlug = { $eq: topicSlug };
    if (subtopicSlug) filters.subtopicSlug = { $eq: subtopicSlug };
    if (isExpertMode !== undefined) filters.isExpertMode = { $eq: isExpertMode === 'true' };

    // Time range filtering
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'weekly':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'monthly':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
      }
      
      if (startDate) {
        filters.createdAt = { $gte: startDate };
      }
    }

    const entries = await strapi.entityService.findMany(
      'api::leaderboard-entry.leaderboard-entry',
      {
        filters,
        sort: { score: 'desc', avgReactionTime: 'asc' },
        limit: parseInt(limit as string),
        populate: ['quiz_topic', 'quiz_subtopic']
      }
    );

    return entries;
  },

  // Get mastery leaderboard (medal tally)
  async getMastery(ctx) {
    const { topicSlug } = ctx.query;

    if (!topicSlug) {
      return ctx.badRequest('topicSlug is required');
    }

    // Get all subtopics for this topic
    const subtopics = await strapi.entityService.findMany(
      'api::quiz-subtopic.quiz-subtopic',
      {
        filters: { quiz_topic: { slug: topicSlug } },
        fields: ['id', 'slug', 'name']
      }
    );

    const subtopicIds = subtopics.map(st => st.id);

    // Get top 10 for each subtopic
    const masteryData = {};

    for (const subtopic of subtopics) {
      const topPlayers = await strapi.entityService.findMany(
        'api::leaderboard-entry.leaderboard-entry',
        {
          filters: { 
            subtopicSlug: subtopic.slug,
            topicSlug 
          },
          sort: { score: 'desc', avgReactionTime: 'asc' },
          limit: 10,
          fields: ['playerName', 'city', 'score']
        }
      );

      topPlayers.forEach((player, index) => {
        if (!masteryData[player.playerName]) {
          masteryData[player.playerName] = {
            playerName: player.playerName,
            city: player.city,
            gold: 0,
            silver: 0,
            bronze: 0,
            subtopics: []
          };
        }

        const medal = index === 0 ? 'gold' : index <= 4 ? 'silver' : 'bronze';
        masteryData[player.playerName][medal]++;
        masteryData[player.playerName].subtopics.push({
          name: subtopic.name,
          rank: index + 1,
          medal
        });
      });
    }

    // Sort by Olympic medal tally rules
    const sortedMastery = Object.values(masteryData).sort((a: any, b: any) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      return b.bronze - a.bronze;
    });

    return sortedMastery;
  },

  // Submit new leaderboard entry
  async create(ctx) {
    const { data } = ctx.request.body;

    // Validate required fields
    if (!data.playerName || !data.city || !data.score) {
      return ctx.badRequest('Missing required fields');
    }

    // Round avgReactionTime to 2 decimals
    if (data.avgReactionTime) {
      data.avgReactionTime = parseFloat(data.avgReactionTime.toFixed(2));
    }

    const entry = await strapi.entityService.create(
      'api::leaderboard-entry.leaderboard-entry',
      { data }
    );

    return entry;
  }
};
```

### Custom Routes

**File:** `cms/src/api/leaderboard-entry/routes/custom-routes.ts`

```typescript
export default {
  routes: [
    {
      method: 'GET',
      path: '/leaderboard-entries/mastery',
      handler: 'leaderboard-entry.getMastery',
      config: {
        auth: false
      }
    }
  ]
};
```

---

## 🔗 Next.js Integration

### 1. Server-Side API Functions

**File:** `app/lib/leaderboard-api.ts`

```typescript
import { STRAPI_URL, STRAPI_TOKEN } from './strapi-server'

export interface LeaderboardEntry {
  id: number
  playerName: string
  city: string
  score: number
  avgReactionTime: number
  isExpertMode: boolean
  topicSlug: string
  subtopicSlug: string
  questionsAnswered: number
  correctAnswers: number
  createdAt: string
  quiz_topic?: {
    topicName: string
    slug: string
  }
  quiz_subtopic?: {
    name: string
    slug: string
  }
}

export interface MasteryEntry {
  playerName: string
  city: string
  gold: number
  silver: number
  bronze: number
  subtopics: Array<{
    name: string
    rank: number
    medal: 'gold' | 'silver' | 'bronze'
  }>
}

export type TimeRange = 'all' | 'daily' | 'weekly' | 'monthly'

interface LeaderboardFilters {
  city?: string
  topicSlug?: string
  subtopicSlug?: string
  isExpertMode?: boolean
  timeRange?: TimeRange
  limit?: number
}

// Fetch leaderboard entries
export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams()
  
  if (filters.city) params.append('city', filters.city)
  if (filters.topicSlug) params.append('topicSlug', filters.topicSlug)
  if (filters.subtopicSlug) params.append('subtopicSlug', filters.subtopicSlug)
  if (filters.isExpertMode !== undefined) {
    params.append('isExpertMode', String(filters.isExpertMode))
  }
  if (filters.timeRange) params.append('timeRange', filters.timeRange)
  if (filters.limit) params.append('limit', String(filters.limit))

  const url = `${STRAPI_URL}/api/leaderboard-entries?${params.toString()}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    next: { revalidate: 60 } // Cache for 1 minute
  })

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard')
  }

  return response.json()
}

// Fetch mastery leaderboard
export async function getMasteryLeaderboard(
  topicSlug: string
): Promise<MasteryEntry[]> {
  const url = `${STRAPI_URL}/api/leaderboard-entries/mastery?topicSlug=${topicSlug}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    next: { revalidate: 300 } // Cache for 5 minutes
  })

  if (!response.ok) {
    throw new Error('Failed to fetch mastery leaderboard')
  }

  return response.json()
}

// Submit leaderboard entry (client-side)
export async function submitLeaderboardEntry(data: {
  playerName: string
  city: string
  score: number
  avgReactionTime: number
  isExpertMode: boolean
  topicSlug: string
  subtopicSlug: string
  questionsAnswered: number
  correctAnswers: number
}): Promise<LeaderboardEntry> {
  const url = `${STRAPI_URL}/api/leaderboard-entries`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  })

  if (!response.ok) {
    throw new Error('Failed to submit leaderboard entry')
  }

  const result = await response.json()
  return result.data
}

// Get available cities
export async function getCities(): Promise<string[]> {
  const url = `${STRAPI_URL}/api/leaderboard-entries?fields[0]=city`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Content-Type': 'application/json'
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!response.ok) {
    return []
  }

  const entries = await response.json()
  const cities = [...new Set(entries.map((e: any) => e.city))].sort()
  return cities
}
```

---

## 🎨 UI/UX Design

### Design Principles

1. **Progressive Disclosure** - Don't show all filters at once
2. **Visual Hierarchy** - Most popular views first
3. **Clear CTAs** - Obvious buttons for actions
4. **Celebration** - Animate achievements and rankings
5. **Simplicity** - One primary action per screen

### Color Scheme (Following Design System)

```typescript
const LEADERBOARD_COLORS = {
  gold: '#FBBF24',      // Yellow-400
  silver: '#D1D5DB',    // Gray-300
  bronze: '#F97316',    // Orange-500
  primary: '#8B7FC8',   // Primary Purple
  expert: '#6B5FA8',    // Dark Purple
  normal: '#B4A5E8',    // Light Purple
  highlight: '#4ADE80', // Green-400
}
```

### Screen Layouts

#### 1. Submit Score Screen (Modal/Page)

**Location:** After quiz completion, on results page

**Layout:**
```
┌─────────────────────────────────┐
│  🎉 Amazing Score!              │
│                                 │
│  Your Score: 140 / 160          │
│  Avg Time: 4.23s                │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 👤 Your Name              │ │
│  │ [________________]        │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 📍 Your City              │ │
│  │ [▼ Select City ___]       │ │
│  └───────────────────────────┘ │
│                                 │
│  [ Submit to Leaderboard ]     │
│  [ Skip ]                       │
└─────────────────────────────────┘
```

**Features:**
- Auto-fill from previous submissions (localStorage)
- City dropdown with search
- Show potential rank preview
- Celebrate with confetti animation on submit

#### 2. Leaderboard Home Screen

**Location:** `/leaderboard` page

**Layout:**
```
┌─────────────────────────────────────────┐
│  🏆 Leaderboards                        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🌍 City Rankings                │   │
│  │ See who's top in your city      │   │
│  │                          [View →]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📚 Topic Rankings               │   │
│  │ Master specific topics          │   │
│  │                          [View →]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🥇 Mastery Leaderboard          │   │
│  │ Olympic-style medal tally       │   │
│  │                          [View →]│   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚡ Expert Mode Champions        │   │
│  │ The ultimate challenge          │   │
│  │                          [View →]│   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features:**
- Large, tappable cards
- Icons for visual appeal
- Brief descriptions
- Clear navigation arrows

#### 3. City Leaderboard Screen

**Location:** `/leaderboard/city`

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← 🌍 City Rankings                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📍 [▼ Select City ___________]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ All Time ] [ Month ] [ Week ] [Day] │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🥇 1. Rahul Kumar        160pts │   │
│  │    ⚡ 3.45s | Expert Mode       │   │
│  ├─────────────────────────────────┤   │
│  │ 🥈 2. Priya Singh        155pts │   │
│  │    ⚡ 4.12s | Normal Mode       │   │
│  ├─────────────────────────────────┤   │
│  │ 🥉 3. Amit Patel         150pts │   │
│  │    ⚡ 3.89s | Expert Mode       │   │
│  ├─────────────────────────────────┤   │
│  │    4. You                145pts │   │
│  │    ⚡ 4.56s | Normal Mode       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ Load More ]                          │
└─────────────────────────────────────────┘
```

**Features:**
- Sticky city selector at top
- Time range tabs (horizontal scroll on mobile)
- Medal emojis for top 3
- Highlight user's position
- Expert mode badge
- Smooth scroll to user's rank

#### 4. Topic Leaderboard Screen

**Location:** `/leaderboard/topic`

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← 📚 Topic Rankings                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🕉️ [▼ Select Topic _________]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🌊 [▼ Select Subtopic _______]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [ Normal Mode ] [ Expert Mode ] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ All Time ] [ Month ] [ Week ] [Day] │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🥇 1. Sita Devi          160pts │   │
│  │    Mumbai | ⚡ 2.89s            │   │
│  ├─────────────────────────────────┤   │
│  │ 🥈 2. Ram Kumar          158pts │   │
│  │    Delhi | ⚡ 3.12s              │   │
│  ├─────────────────────────────────┤   │
│  │ 🥉 3. Lakshmi Iyer       155pts │   │
│  │    Bangalore | ⚡ 3.45s          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Features:**
- Cascading dropdowns (Topic → Subtopic)
- Mode toggle (Normal/Expert) with visual distinction
- Time range tabs
- City shown for context
- Smooth animations on filter changes

#### 5. Mastery Leaderboard Screen

**Location:** `/leaderboard/mastery`

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← 🥇 Mastery Leaderboard               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🕉️ [▼ Select Topic _________]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Olympic Medal Tally Style              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🥇 1. Rahul Kumar               │   │
│  │    Mumbai                       │   │
│  │    🥇 3  🥈 5  🥉 2             │   │
│  │    [View Details →]             │   │
│  ├─────────────────────────────────┤   │
│  │ 🥈 2. Priya Singh               │   │
│  │    Delhi                        │   │
│  │    🥇 2  🥈 4  🥉 6             │   │
│  │    [View Details →]             │   │
│  ├─────────────────────────────────┤   │
│  │ 🥉 3. Amit Patel                │   │
│  │    Bangalore                    │   │
│  │    🥇 2  🥈 3  🥉 4             │   │
│  │    [View Details →]             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Expanded Details Modal:**
```
┌─────────────────────────────────────────┐
│  Rahul Kumar - Nadi Topic               │
│                                         │
│  🥇 Gold Medals (1st Place)             │
│  • Ganga                                │
│  • Yamuna                               │
│  • Saraswati                            │
│                                         │
│  🥈 Silver Medals (2nd-5th)             │
│  • Godavari (2nd)                       │
│  • Krishna (3rd)                        │
│  • Narmada (4th)                        │
│  • Kaveri (5th)                         │
│  • Brahmaputra (5th)                    │
│                                         │
│  🥉 Bronze Medals (6th-10th)            │
│  • Sindhu (7th)                         │
│  • Tapti (9th)                          │
│                                         │
│  [ Close ]                              │
└─────────────────────────────────────────┘
```

---

## 🚀 Implementation Steps

### Phase 1: Strapi Setup (Backend)

**Step 1.1: Create Collections**
```bash
cd cms
npm run strapi generate
# Select: api
# Name: leaderboard-entry
# Create collection type
```

**Step 1.2: Configure Schema**
- Copy the schema JSON from above
- Paste into `cms/src/api/leaderboard-entry/content-types/leaderboard-entry/schema.json`
- Restart Strapi: `npm run develop`

**Step 1.3: Set Permissions**
- Go to Settings → Roles → Public
- Enable for `leaderboard-entry`:
  - `find` (GET all)
  - `findOne` (GET one)
  - `create` (POST)
- Enable custom route: `getMastery`

**Step 1.4: Add Custom Controller**
- Create/update `cms/src/api/leaderboard-entry/controllers/leaderboard-entry.ts`
- Add the controller code from above
- Create `cms/src/api/leaderboard-entry/routes/custom-routes.ts`
- Add custom route for mastery endpoint

**Step 1.5: Test API**
```bash
# Test GET leaderboard
curl http://localhost:1337/api/leaderboard-entries

# Test POST entry
curl -X POST http://localhost:1337/api/leaderboard-entries \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "playerName": "Test User",
      "city": "Mumbai",
      "score": 140,
      "avgReactionTime": 4.23,
      "isExpertMode": false,
      "topicSlug": "nadi",
      "subtopicSlug": "ganga",
      "questionsAnswered": 7,
      "correctAnswers": 6
    }
  }'

# Test mastery endpoint
curl http://localhost:1337/api/leaderboard-entries/mastery?topicSlug=nadi
```

### Phase 2: Next.js Integration (Frontend)

**Step 2.1: Create API Functions**
```bash
cd app
# Create leaderboard API file
touch lib/leaderboard-api.ts
```
- Copy the API functions code from above

**Step 2.2: Update Zustand Store**

Add to `app/stores/useQuizStore.ts`:
```typescript
interface QuizStore {
  // ... existing fields
  
  // Leaderboard data
  canSubmitToLeaderboard: boolean
  leaderboardSubmitted: boolean
  
  setCanSubmitToLeaderboard: (can: boolean) => void
  setLeaderboardSubmitted: (submitted: boolean) => void
  resetLeaderboardState: () => void
}

// In create function:
canSubmitToLeaderboard: false,
leaderboardSubmitted: false,

setCanSubmitToLeaderboard: (can) => set({ canSubmitToLeaderboard: can }),
setLeaderboardSubmitted: (submitted) => set({ leaderboardSubmitted: submitted }),
resetLeaderboardState: () => set({ 
  canSubmitToLeaderboard: false, 
  leaderboardSubmitted: false 
}),
```

**Step 2.3: Create Leaderboard Components**

Create these component files:
```
app/components/leaderboard/
├── SubmitScoreModal.tsx       # Submit score form
├── LeaderboardCard.tsx        # Individual entry card
├── LeaderboardList.tsx        # List of entries
├── MasteryCard.tsx            # Mastery entry card
├── FilterBar.tsx              # Time range + mode filters
├── CitySelector.tsx           # City dropdown
├── TopicSelector.tsx          # Topic/subtopic dropdowns
└── MedalDisplay.tsx           # Medal count display
```

**Step 2.4: Create Leaderboard Pages**

Create these page files:
```
app/app/leaderboard/
├── page.tsx                   # Leaderboard home
├── city/page.tsx              # City leaderboard
├── topic/page.tsx             # Topic leaderboard
└── mastery/page.tsx           # Mastery leaderboard
```

**Step 2.5: Update Results Page**

Add to `app/app/results/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import SubmitScoreModal from '@/components/leaderboard/SubmitScoreModal'

// Inside component:
const [showSubmitModal, setShowSubmitModal] = useState(false)

// Add button in action buttons section:
<button
  onClick={() => setShowSubmitModal(true)}
  className="bg-[#FBBF24] text-white rounded-xl px-6 py-3"
>
  🏆 Submit to Leaderboard
</button>

{showSubmitModal && (
  <SubmitScoreModal
    score={score}
    avgReactionTime={avgReactionTime}
    topicSlug={quizTopicSlug}
    subtopicSlug={quizSubtopicSlug}
    isExpertMode={isExpertMode}
    questionsAnswered={totalQuestions}
    correctAnswers={correctAnswers}
    onClose={() => setShowSubmitModal(false)}
    onSuccess={() => {
      setShowSubmitModal(false)
      // Show success message
    }}
  />
)}
```

**Step 2.6: Add Navigation**

Update `app/app/page.tsx` (home page):
```typescript
<Link
  href="/leaderboard"
  className="bg-[#FBBF24] text-white rounded-xl px-6 py-3 flex items-center gap-2"
>
  🏆 Leaderboards
</Link>
```

### Phase 3: Component Implementation

**Step 3.1: SubmitScoreModal Component**

**File:** `app/components/leaderboard/SubmitScoreModal.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { submitLeaderboardEntry, getCities } from '@/lib/leaderboard-api'
import { trackEvent } from '@/lib/analytics'

interface SubmitScoreModalProps {
  score: number
  avgReactionTime: number
  topicSlug: string
  subtopicSlug: string
  isExpertMode: boolean
  questionsAnswered: number
  correctAnswers: number
  onClose: () => void
  onSuccess: () => void
}

export default function SubmitScoreModal({
  score,
  avgReactionTime,
  topicSlug,
  subtopicSlug,
  isExpertMode,
  questionsAnswered,
  correctAnswers,
  onClose,
  onSuccess
}: SubmitScoreModalProps) {
  const [playerName, setPlayerName] = useState('')
  const [city, setCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load saved name and city from localStorage
    const savedName = localStorage.getItem('playerName')
    const savedCity = localStorage.getItem('playerCity')
    if (savedName) setPlayerName(savedName)
    if (savedCity) setCity(savedCity)

    // Load cities
    getCities().then(setCities)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!playerName.trim() || !city.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      await submitLeaderboardEntry({
        playerName: playerName.trim(),
        city: city.trim(),
        score,
        avgReactionTime: parseFloat(avgReactionTime.toFixed(2)),
        isExpertMode,
        topicSlug,
        subtopicSlug,
        questionsAnswered,
        correctAnswers
      })

      // Save to localStorage for next time
      localStorage.setItem('playerName', playerName.trim())
      localStorage.setItem('playerCity', city.trim())

      // Track analytics
      trackEvent('leaderboard_submitted', {
        score,
        city,
        topic: topicSlug,
        subtopic: subtopicSlug,
        is_expert_mode: isExpertMode
      })

      onSuccess()
    } catch (err) {
      setError('Failed to submit. Please try again.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#8B7FC8] mb-4">
          🎉 Submit Your Score!
        </h2>

        <div className="bg-[#B4A5E8]/20 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Score:</span>
            <span className="font-bold text-[#8B7FC8]">{score} pts</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Time:</span>
            <span className="font-bold text-[#8B7FC8]">{avgReactionTime.toFixed(2)}s</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              👤 Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8B7FC8] outline-none"
              placeholder="Enter your name"
              maxLength={50}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">
              📍 Your City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="cities"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8B7FC8] outline-none"
              placeholder="Enter your city"
              maxLength={100}
            />
            <datalist id="cities">
              {cities.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#8B7FC8] text-white rounded-xl py-3 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : '🏆 Submit'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 rounded-xl py-3 font-medium"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Step 3.2: LeaderboardList Component**

**File:** `app/components/leaderboard/LeaderboardList.tsx`

```typescript
'use client'

import { LeaderboardEntry } from '@/lib/leaderboard-api'

interface LeaderboardListProps {
  entries: LeaderboardEntry[]
  currentPlayerName?: string
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉']

export default function LeaderboardList({ 
  entries, 
  currentPlayerName 
}: LeaderboardListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No entries yet. Be the first! 🚀
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const isCurrentPlayer = entry.playerName === currentPlayerName
        const rank = index + 1
        const medal = rank <= 3 ? MEDAL_EMOJIS[rank - 1] : null

        return (
          <div
            key={entry.id}
            className={`
              bg-white rounded-xl p-4 border-2 transition-all
              ${isCurrentPlayer 
                ? 'border-[#8B7FC8] bg-[#B4A5E8]/10' 
                : 'border-gray-200'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-400 w-12 text-center">
                {medal || rank}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-800">
                    {entry.playerName}
                  </span>
                  {isCurrentPlayer && (
                    <span className="text-xs bg-[#8B7FC8] text-white px-2 py-1 rounded">
                      You
                    </span>
                  )}
                  {entry.isExpertMode && (
                    <span className="text-xs bg-[#6B5FA8] text-white px-2 py-1 rounded">
                      ⚡ Expert
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {entry.city} • ⚡ {entry.avgReactionTime.toFixed(2)}s
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-[#8B7FC8]">
                  {entry.score}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

**Step 3.3: MasteryCard Component**

**File:** `app/components/leaderboard/MasteryCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import { MasteryEntry } from '@/lib/leaderboard-api'

interface MasteryCardProps {
  entry: MasteryEntry
  rank: number
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉']

export default function MasteryCard({ entry, rank }: MasteryCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const medal = rank <= 3 ? MEDAL_EMOJIS[rank - 1] : null

  const goldSubtopics = entry.subtopics.filter(s => s.medal === 'gold')
  const silverSubtopics = entry.subtopics.filter(s => s.medal === 'silver')
  const bronzeSubtopics = entry.subtopics.filter(s => s.medal === 'bronze')

  return (
    <>
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl font-bold text-gray-400 w-12 text-center">
            {medal || rank}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-800 text-lg">
              {entry.playerName}
            </div>
            <div className="text-sm text-gray-600">{entry.city}</div>
          </div>
        </div>

        <div className="flex gap-4 mb-3 pl-15">
          <div className="flex items-center gap-1">
            <span className="text-2xl">🥇</span>
            <span className="font-bold text-[#FBBF24]">{entry.gold}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl">🥈</span>
            <span className="font-bold text-[#D1D5DB]">{entry.silver}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl">🥉</span>
            <span className="font-bold text-[#F97316]">{entry.bronze}</span>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(true)}
          className="text-[#8B7FC8] text-sm font-medium pl-15"
        >
          View Details →
        </button>
      </div>

      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#8B7FC8] mb-4">
              {entry.playerName} - Mastery Details
            </h3>

            {goldSubtopics.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-[#FBBF24] mb-2 flex items-center gap-2">
                  🥇 Gold Medals (1st Place)
                </h4>
                <ul className="space-y-1 pl-4">
                  {goldSubtopics.map((s, i) => (
                    <li key={i} className="text-gray-700">• {s.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {silverSubtopics.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-600 mb-2 flex items-center gap-2">
                  🥈 Silver Medals (2nd-5th)
                </h4>
                <ul className="space-y-1 pl-4">
                  {silverSubtopics.map((s, i) => (
                    <li key={i} className="text-gray-700">
                      • {s.name} ({s.rank}th)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bronzeSubtopics.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold text-[#F97316] mb-2 flex items-center gap-2">
                  🥉 Bronze Medals (6th-10th)
                </h4>
                <ul className="space-y-1 pl-4">
                  {bronzeSubtopics.map((s, i) => (
                    <li key={i} className="text-gray-700">
                      • {s.name} ({s.rank}th)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowDetails(false)}
              className="w-full bg-[#8B7FC8] text-white rounded-xl py-3 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

**Step 3.4: FilterBar Component**

**File:** `app/components/leaderboard/FilterBar.tsx`

```typescript
'use client'

import { TimeRange } from '@/lib/leaderboard-api'

interface FilterBarProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  showModeToggle?: boolean
  isExpertMode?: boolean
  onModeChange?: (isExpert: boolean) => void
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'monthly', label: 'Month' },
  { value: 'weekly', label: 'Week' },
  { value: 'daily', label: 'Today' },
]

export default function FilterBar({
  timeRange,
  onTimeRangeChange,
  showModeToggle = false,
  isExpertMode = false,
  onModeChange
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Time Range Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TIME_RANGES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimeRangeChange(value)}
            className={`
              px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
              ${timeRange === value
                ? 'bg-[#8B7FC8] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mode Toggle */}
      {showModeToggle && onModeChange && (
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange(false)}
            className={`
              flex-1 py-3 rounded-xl font-medium transition-all
              ${!isExpertMode
                ? 'bg-[#B4A5E8] text-white'
                : 'bg-gray-200 text-gray-700'
              }
            `}
          >
            Normal Mode
          </button>
          <button
            onClick={() => onModeChange(true)}
            className={`
              flex-1 py-3 rounded-xl font-medium transition-all
              ${isExpertMode
                ? 'bg-[#6B5FA8] text-white'
                : 'bg-gray-200 text-gray-700'
              }
            `}
          >
            ⚡ Expert Mode
          </button>
        </div>
      )}
    </div>
  )
}
```

### Phase 4: Page Implementation

**Step 4.1: Leaderboard Home Page**

**File:** `app/app/leaderboard/page.tsx`

```typescript
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

export default function LeaderboardHomePage() {
  return (
    <div className="min-h-screen bg-[#B4A5E8]/10 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#8B7FC8] mb-6">
          🏆 Leaderboards
        </h1>

        <div className="space-y-4">
          {/* City Rankings */}
          <Link
            href="/leaderboard/city"
            className="block bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#8B7FC8] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">🌍</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  City Rankings
                </h2>
                <p className="text-gray-600 text-sm">
                  See who's top in your city
                </p>
              </div>
              <div className="text-[#8B7FC8] text-2xl">→</div>
            </div>
          </Link>

          {/* Topic Rankings */}
          <Link
            href="/leaderboard/topic"
            className="block bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#8B7FC8] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">📚</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Topic Rankings
                </h2>
                <p className="text-gray-600 text-sm">
                  Master specific topics
                </p>
              </div>
              <div className="text-[#8B7FC8] text-2xl">→</div>
            </div>
          </Link>

          {/* Mastery Leaderboard */}
          <Link
            href="/leaderboard/mastery"
            className="block bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#8B7FC8] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl mb-2">🥇</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Mastery Leaderboard
                </h2>
                <p className="text-gray-600 text-sm">
                  Olympic-style medal tally
                </p>
              </div>
              <div className="text-[#8B7FC8] text-2xl">→</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**Step 4.2: City Leaderboard Page**

**File:** `app/app/leaderboard/city/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLeaderboard, getCities, TimeRange } from '@/lib/leaderboard-api'
import LeaderboardList from '@/components/leaderboard/LeaderboardList'
import FilterBar from '@/components/leaderboard/FilterBar'

export default function CityLeaderboardPage() {
  const router = useRouter()
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCities().then(cities => {
      setCities(cities)
      // Auto-select user's saved city
      const savedCity = localStorage.getItem('playerCity')
      if (savedCity && cities.includes(savedCity)) {
        setSelectedCity(savedCity)
      } else if (cities.length > 0) {
        setSelectedCity(cities[0])
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedCity) return

    setLoading(true)
    getLeaderboard({ city: selectedCity, timeRange, limit: 100 })
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [selectedCity, timeRange])

  const currentPlayerName = localStorage.getItem('playerName') || undefined

  return (
    <div className="min-h-screen bg-[#B4A5E8]/10 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-[#8B7FC8] mb-4 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-[#8B7FC8] mb-6">
          🌍 City Rankings
        </h1>

        {/* City Selector */}
        <div className="mb-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#8B7FC8] outline-none"
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <LeaderboardList 
            entries={entries} 
            currentPlayerName={currentPlayerName}
          />
        )}
      </div>
    </div>
  )
}
```

**Step 4.3: Topic Leaderboard Page**

**File:** `app/app/leaderboard/topic/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getLeaderboard, TimeRange } from '@/lib/leaderboard-api'
import { getTopics, getSubtopics } from '@/lib/strapi-server'
import LeaderboardList from '@/components/leaderboard/LeaderboardList'
import FilterBar from '@/components/leaderboard/FilterBar'

export default function TopicLeaderboardPage() {
  const router = useRouter()
  const [topics, setTopics] = useState([])
  const [subtopics, setSubtopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedSubtopic, setSelectedSubtopic] = useState('')
  const [isExpertMode, setIsExpertMode] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getTopics().then(setTopics)
  }, [])

  useEffect(() => {
    if (!selectedTopic) return
    getSubtopics(selectedTopic).then(subs => {
      setSubtopics(subs)
      if (subs.length > 0) {
        setSelectedSubtopic(subs[0].slug)
      }
    })
  }, [selectedTopic])

  useEffect(() => {
    if (!selectedTopic || !selectedSubtopic) return

    setLoading(true)
    getLeaderboard({
      topicSlug: selectedTopic,
      subtopicSlug: selectedSubtopic,
      isExpertMode,
      timeRange,
      limit: 100
    })
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [selectedTopic, selectedSubtopic, isExpertMode, timeRange])

  const currentPlayerName = localStorage.getItem('playerName') || undefined

  return (
    <div className="min-h-screen bg-[#B4A5E8]/10 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-[#8B7FC8] mb-4 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-[#8B7FC8] mb-6">
          📚 Topic Rankings
        </h1>

        {/* Topic Selector */}
        <div className="mb-4">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#8B7FC8] outline-none"
          >
            <option value="">Select Topic</option>
            {topics.map((topic: any) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.topicName}
              </option>
            ))}
          </select>
        </div>

        {/* Subtopic Selector */}
        {selectedTopic && (
          <div className="mb-4">
            <select
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#8B7FC8] outline-none"
            >
              <option value="">Select Subtopic</option>
              {subtopics.map((subtopic: any) => (
                <option key={subtopic.slug} value={subtopic.slug}>
                  {subtopic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filters */}
        {selectedSubtopic && (
          <div className="mb-6">
            <FilterBar
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              showModeToggle
              isExpertMode={isExpertMode}
              onModeChange={setIsExpertMode}
            />
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : selectedSubtopic ? (
          <LeaderboardList 
            entries={entries} 
            currentPlayerName={currentPlayerName}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select a topic and subtopic to view rankings
          </div>
        )}
      </div>
    </div>
  )
}
```

**Step 4.4: Mastery Leaderboard Page**

**File:** `app/app/leaderboard/mastery/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMasteryLeaderboard } from '@/lib/leaderboard-api'
import { getTopics } from '@/lib/strapi-server'
import MasteryCard from '@/components/leaderboard/MasteryCard'

export default function MasteryLeaderboardPage() {
  const router = useRouter()
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getTopics().then(topics => {
      setTopics(topics)
      if (topics.length > 0) {
        setSelectedTopic(topics[0].slug)
      }
    })
  }, [])

  useEffect(() => {
    if (!selectedTopic) return

    setLoading(true)
    getMasteryLeaderboard(selectedTopic)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [selectedTopic])

  return (
    <div className="min-h-screen bg-[#B4A5E8]/10 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-[#8B7FC8] mb-4 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-[#8B7FC8] mb-6">
          🥇 Mastery Leaderboard
        </h1>

        <p className="text-gray-600 mb-6">
          Olympic-style medal tally. Gold = 1st place, Silver = 2nd-5th, Bronze = 6th-10th
        </p>

        {/* Topic Selector */}
        <div className="mb-6">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-[#8B7FC8] outline-none"
          >
            <option value="">Select Topic</option>
            {topics.map((topic: any) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.topicName}
              </option>
            ))}
          </select>
        </div>

        {/* Mastery Leaderboard */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry: any, index) => (
              <MasteryCard key={index} entry={entry} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No mastery data yet. Start playing to earn medals! 🏅
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🎨 UX Enhancement Recommendations

### 1. Progressive Disclosure Strategy

**Home Screen:**
- Show only 4 main leaderboard types
- Use large, colorful cards with icons
- Brief one-line descriptions
- Clear visual hierarchy

**Filter Screens:**
- Start with most common filter (All Time)
- Show filters progressively as user scrolls
- Use sticky headers for context
- Collapse advanced filters by default

### 2. Visual Feedback

**Animations:**
```typescript
// Add to components
import { motion } from 'motion/react'

// Animate list items
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
  {/* Leaderboard entry */}
</motion.div>

// Celebrate submission
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: 'spring', bounce: 0.5 }}
>
  🎉 Score Submitted!
</motion.div>
```

**Color Coding:**
- Gold: `#FBBF24` (warm, celebratory)
- Silver: `#D1D5DB` (neutral, elegant)
- Bronze: `#F97316` (energetic)
- Expert Mode: `#6B5FA8` (deep purple, premium)
- Normal Mode: `#B4A5E8` (light purple, accessible)

### 3. Gamification Elements

**Rank Badges:**
```typescript
const RANK_BADGES = {
  1: { emoji: '🥇', color: '#FBBF24', label: 'Champion' },
  2: { emoji: '🥈', color: '#D1D5DB', label: 'Runner-up' },
  3: { emoji: '🥉', color: '#F97316', label: 'Third Place' },
  top10: { emoji: '⭐', color: '#8B7FC8', label: 'Top 10' },
  top50: { emoji: '✨', color: '#B4A5E8', label: 'Top 50' },
}
```

**Achievement Notifications:**
- "You're in the Top 10!" with confetti
- "New Personal Best!" with sparkles
- "City Champion!" with crown animation

### 4. Smart Defaults

**Auto-Selection Logic:**
```typescript
// Auto-select user's city
const savedCity = localStorage.getItem('playerCity')
if (savedCity) setSelectedCity(savedCity)

// Auto-select last played topic
const lastTopic = localStorage.getItem('lastPlayedTopic')
if (lastTopic) setSelectedTopic(lastTopic)

// Remember filter preferences
const preferredTimeRange = localStorage.getItem('leaderboardTimeRange') || 'all'
setTimeRange(preferredTimeRange)
```

**Scroll to User:**
```typescript
useEffect(() => {
  if (entries.length > 0 && currentPlayerName) {
    const userIndex = entries.findIndex(e => e.playerName === currentPlayerName)
    if (userIndex > 3) {
      // Scroll to user's position
      const element = document.getElementById(`entry-${userIndex}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
}, [entries, currentPlayerName])
```

### 5. Empty States

**No Entries:**
```typescript
<div className="text-center py-12">
  <div className="text-6xl mb-4">🏆</div>
  <h3 className="text-xl font-bold text-gray-800 mb-2">
    Be the First!
  </h3>
  <p className="text-gray-600 mb-6">
    No one has posted a score yet. Start playing and claim the top spot!
  </p>
  <Link
    href="/topics"
    className="inline-block bg-[#8B7FC8] text-white px-6 py-3 rounded-xl font-medium"
  >
    Start Playing →
  </Link>
</div>
```

**Loading States:**
```typescript
<div className="space-y-3">
  {[1, 2, 3, 4, 5].map(i => (
    <div key={i} className="bg-gray-200 rounded-xl h-20 animate-pulse" />
  ))}
</div>
```

### 6. Mobile Optimizations

**Touch Targets:**
- Minimum 44px height for all buttons
- Adequate spacing between interactive elements
- Large tap areas for dropdowns

**Horizontal Scroll:**
```typescript
<div className="flex gap-2 overflow-x-auto pb-2 snap-x">
  {filters.map(filter => (
    <button className="snap-start flex-shrink-0 ...">
      {filter.label}
    </button>
  ))}
</div>
```

**Pull to Refresh:**
```typescript
// Optional: Add pull-to-refresh for mobile
import { useState } from 'react'

const [refreshing, setRefreshing] = useState(false)

const handleRefresh = async () => {
  setRefreshing(true)
  await fetchLeaderboard()
  setRefreshing(false)
}
```

### 7. Performance Optimizations

**Caching Strategy:**
```typescript
// In leaderboard-api.ts
export async function getLeaderboard(filters: LeaderboardFilters) {
  const cacheKey = JSON.stringify(filters)
  const cached = sessionStorage.getItem(cacheKey)
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    // Cache valid for 1 minute
    if (Date.now() - timestamp < 60000) {
      return data
    }
  }
  
  const data = await fetchLeaderboard(filters)
  sessionStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
  
  return data
}
```

**Pagination:**
```typescript
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  const newEntries = await getLeaderboard({
    ...filters,
    limit: 20,
    offset: page * 20
  })
  
  if (newEntries.length < 20) setHasMore(false)
  setEntries([...entries, ...newEntries])
  setPage(page + 1)
}

// Infinite scroll
<div ref={bottomRef} />
useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    }
  )
  if (bottomRef.current) observer.observe(bottomRef.current)
  return () => observer.disconnect()
}, [hasMore])
```

---

## 📊 Analytics Tracking

### Events to Track

```typescript
// Submit score
trackEvent('leaderboard_score_submitted', {
  score,
  city,
  topic,
  subtopic,
  is_expert_mode,
  avg_reaction_time
})

// View leaderboard
trackEvent('leaderboard_viewed', {
  type: 'city' | 'topic' | 'mastery',
  filters: { city, topic, timeRange, isExpertMode }
})

// Filter changed
trackEvent('leaderboard_filter_changed', {
  filter_type: 'time_range' | 'mode' | 'city' | 'topic',
  value
})

// View details
trackEvent('mastery_details_viewed', {
  player_name,
  topic
})
```

---

## ✅ Testing Checklist

### Backend Testing

- [ ] Strapi collections created successfully
- [ ] API endpoints return correct data
- [ ] Filtering works (city, topic, subtopic, mode, time range)
- [ ] Sorting works (score desc, avgReactionTime asc)
- [ ] Mastery endpoint calculates medals correctly
- [ ] POST endpoint validates required fields
- [ ] Decimal precision for avgReactionTime (2 decimals)
- [ ] Permissions set correctly for public access

### Frontend Testing

- [ ] Submit score modal opens on results page
- [ ] Form validation works (required fields)
- [ ] City autocomplete works
- [ ] Score submits successfully
- [ ] Success message shows after submission
- [ ] localStorage saves player name and city
- [ ] Leaderboard home page displays all categories
- [ ] City leaderboard filters work
- [ ] Topic leaderboard cascading dropdowns work
- [ ] Mode toggle switches correctly
- [ ] Time range tabs work
- [ ] User's entry is highlighted
- [ ] Scroll to user position works
- [ ] Mastery leaderboard displays medals correctly
- [ ] Medal details modal opens and shows subtopics
- [ ] Empty states display correctly
- [ ] Loading states show during fetch
- [ ] Mobile responsive design works
- [ ] Touch targets are adequate (44px+)
- [ ] Horizontal scroll works on mobile
- [ ] Analytics events fire correctly

### Edge Cases

- [ ] No entries in leaderboard
- [ ] User not in leaderboard
- [ ] Tie scores (sorted by reaction time)
- [ ] Very long player names
- [ ] Very long city names
- [ ] Special characters in names
- [ ] Network errors handled gracefully
- [ ] Slow network conditions
- [ ] Multiple rapid filter changes
- [ ] Browser back button works correctly

---

## 🚀 Deployment Checklist

### Strapi (CMS)

- [ ] Collections deployed to production
- [ ] Custom controllers deployed
- [ ] Custom routes configured
- [ ] Permissions set for public access
- [ ] Database indexes added for performance:
  ```sql
  CREATE INDEX idx_leaderboard_city ON leaderboard_entries(city);
  CREATE INDEX idx_leaderboard_topic ON leaderboard_entries(topicSlug);
  CREATE INDEX idx_leaderboard_subtopic ON leaderboard_entries(subtopicSlug);
  CREATE INDEX idx_leaderboard_score ON leaderboard_entries(score DESC, avgReactionTime ASC);
  CREATE INDEX idx_leaderboard_created ON leaderboard_entries(createdAt DESC);
  ```
- [ ] Environment variables set (STRAPI_URL, STRAPI_TOKEN)
- [ ] Rate limiting configured for POST endpoint
- [ ] CORS configured for Next.js domain

### Next.js (App)

- [ ] Leaderboard pages deployed
- [ ] Components deployed
- [ ] API functions deployed
- [ ] Environment variables set
- [ ] Analytics tracking verified
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] SEO metadata added to pages
- [ ] Social sharing images added

### Monitoring

- [ ] Error tracking set up (Sentry, etc.)
- [ ] Analytics dashboard configured
- [ ] Performance monitoring enabled
- [ ] API response time tracking
- [ ] User engagement metrics tracked

---

## 🎯 Future Enhancements

### Phase 2 Features

1. **Social Sharing**
   - Share leaderboard position on social media
   - Generate shareable images with rank
   - "Challenge your friends" feature

2. **Achievements System**
   - Badges for milestones (100 games, 1000 points, etc.)
   - Special badges for city champions
   - Topic mastery badges

3. **Notifications**
   - Email when overtaken in leaderboard
   - Push notifications for new achievements
   - Weekly leaderboard digest

4. **Advanced Filters**
   - Age groups
   - Gender
   - State/region leaderboards
   - School/college leaderboards

5. **Tournaments**
   - Time-limited competitions
   - Special event leaderboards
   - Prize-based challenges

6. **Player Profiles**
   - Public player profiles
   - Game history
   - Statistics and graphs
   - Follow other players

7. **Teams/Groups**
   - Create teams
   - Team leaderboards
   - Collaborative challenges

---

## 💡 Best Practices

### Data Management

1. **Prevent Spam:**
   ```typescript
   // Rate limiting in Strapi controller
   const recentSubmissions = await strapi.db.query('api::leaderboard-entry.leaderboard-entry')
     .findMany({
       where: {
         playerName: data.playerName,
         createdAt: { $gte: new Date(Date.now() - 60000) } // Last minute
       }
     })
   
   if (recentSubmissions.length >= 3) {
     return ctx.badRequest('Too many submissions. Please wait.')
   }
   ```

2. **Data Validation:**
   ```typescript
   // Validate score is within possible range
   const maxPossibleScore = data.questionsAnswered * 20 * (data.isExpertMode ? 2 : 1)
   if (data.score > maxPossibleScore) {
     return ctx.badRequest('Invalid score')
   }
   
   // Validate reaction time is reasonable
   if (data.avgReactionTime < 0.5 || data.avgReactionTime > 10) {
     return ctx.badRequest('Invalid reaction time')
   }
   ```

3. **Duplicate Prevention:**
   ```typescript
   // Check for duplicate submissions
   const existing = await strapi.db.query('api::leaderboard-entry.leaderboard-entry')
     .findOne({
       where: {
         playerName: data.playerName,
         topicSlug: data.topicSlug,
         subtopicSlug: data.subtopicSlug,
         score: data.score,
         createdAt: { $gte: new Date(Date.now() - 300000) } // Last 5 minutes
       }
     })
   
   if (existing) {
     return ctx.badRequest('Duplicate submission detected')
   }
   ```

### Performance

1. **Database Indexes:**
   - Add indexes on frequently queried fields
   - Composite indexes for common filter combinations
   - Index on createdAt for time-based queries

2. **Caching:**
   - Cache leaderboard data for 1 minute
   - Cache city list for 1 hour
   - Cache mastery data for 5 minutes
   - Use CDN for static assets

3. **Pagination:**
   - Limit results to 100 entries per request
   - Implement infinite scroll for better UX
   - Load more on demand

### Security

1. **Input Sanitization:**
   ```typescript
   // Sanitize player name
   const sanitizedName = data.playerName
     .trim()
     .replace(/[<>]/g, '') // Remove HTML tags
     .substring(0, 50) // Max length
   ```

2. **Rate Limiting:**
   - Limit POST requests to 3 per minute per IP
   - Limit GET requests to 60 per minute per IP
   - Use Strapi rate limiting middleware

3. **Authentication (Optional):**
   - Consider requiring user accounts for leaderboard
   - Verify user identity before submission
   - Prevent impersonation

---

## 🎨 Design System Compliance

### Colors (Following Gyan Pravah Design System)

```typescript
// Leaderboard-specific colors
export const LEADERBOARD_COLORS = {
  // Medals
  gold: '#FBBF24',      // Yellow-400 (approved)
  silver: '#D1D5DB',    // Gray-300 (approved)
  bronze: '#F97316',    // Orange-500 (approved)
  
  // Modes
  primary: '#8B7FC8',   // Primary Purple (approved)
  expert: '#6B5FA8',    // Dark Purple (approved)
  normal: '#B4A5E8',    // Light Purple (approved)
  
  // Status
  correct: '#4ADE80',   // Green-400 (approved)
  highlight: '#FBBF24', // Yellow-400 (approved)
  
  // UI
  background: '#B4A5E8/10', // Light purple tint
  cardBg: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1F2937',
  textSecondary: '#6B7280',
}
```

### Component Styling Rules

**✅ DO:**
- Use solid background colors only
- Use `rounded-xl` (12px) or `rounded-2xl` (16px) for cards
- Use flat design with no shadows
- Use proper contrast ratios (4.5:1 minimum)
- Use Poppins font family

**❌ DON'T:**
- No gradients (`bg-gradient-*`)
- No glassmorphism or backdrop blur
- No neumorphism effects
- No complex shadows
- No trendy AI effects

### Example Component

```typescript
// ✅ CORRECT - Following design system
<div className="bg-white rounded-xl p-4 border-2 border-gray-200">
  <div className="bg-[#8B7FC8] text-white rounded-lg px-4 py-2">
    Leaderboard Entry
  </div>
</div>

// ❌ WRONG - Violates design system
<div className="bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg backdrop-blur">
  <div className="bg-gradient-to-br from-blue-400 to-purple-600">
    Leaderboard Entry
  </div>
</div>
```

---

## 📱 Mobile-First Design Considerations

### Layout Breakpoints

```typescript
// Tailwind breakpoints
const BREAKPOINTS = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
}

// Responsive classes
<div className="
  px-4 sm:px-6 lg:px-8          // Padding
  text-base sm:text-lg lg:text-xl  // Text size
  grid grid-cols-1 md:grid-cols-2   // Grid layout
">
```

### Touch Interactions

```typescript
// Minimum touch target size
const MIN_TOUCH_TARGET = 44 // pixels

// Button sizing
<button className="
  min-h-[44px] min-w-[44px]    // Minimum touch target
  px-6 py-3                     // Comfortable padding
  rounded-xl                    // Rounded corners
  active:scale-95               // Touch feedback
  transition-transform          // Smooth animation
">
```

### Horizontal Scrolling

```typescript
// Scrollable filter tabs
<div className="
  flex gap-2 overflow-x-auto    // Horizontal scroll
  pb-2 snap-x snap-mandatory    // Snap scrolling
  scrollbar-hide                // Hide scrollbar
">
  {filters.map(filter => (
    <button className="
      snap-start                 // Snap to start
      flex-shrink-0              // Don't shrink
      whitespace-nowrap          // Single line
    ">
      {filter.label}
    </button>
  ))}
</div>
```

### Gesture Support

```typescript
// Pull to refresh (optional)
import { useEffect, useState } from 'react'

const [startY, setStartY] = useState(0)
const [pullDistance, setPullDistance] = useState(0)

const handleTouchStart = (e: TouchEvent) => {
  setStartY(e.touches[0].clientY)
}

const handleTouchMove = (e: TouchEvent) => {
  const currentY = e.touches[0].clientY
  const distance = currentY - startY
  
  if (distance > 0 && window.scrollY === 0) {
    setPullDistance(distance)
  }
}

const handleTouchEnd = () => {
  if (pullDistance > 80) {
    // Trigger refresh
    refreshLeaderboard()
  }
  setPullDistance(0)
}
```

---

## 🔍 SEO & Metadata

### Page Metadata

```typescript
// app/leaderboard/page.tsx
export const metadata = {
  title: 'Leaderboards | Gyan Pravah',
  description: 'Compete with players across India. View city rankings, topic leaderboards, and mastery achievements.',
  openGraph: {
    title: 'Gyan Pravah Leaderboards',
    description: 'See who\'s leading in your city and favorite topics',
    images: ['/og-leaderboard.png'],
  },
}

// app/leaderboard/city/page.tsx
export const metadata = {
  title: 'City Rankings | Gyan Pravah Leaderboards',
  description: 'See top players in your city. Daily, weekly, monthly, and all-time rankings.',
}

// app/leaderboard/mastery/page.tsx
export const metadata = {
  title: 'Mastery Leaderboard | Gyan Pravah',
  description: 'Olympic-style medal tally. See who has mastered the most topics.',
}
```

### Structured Data

```typescript
// Add JSON-LD structured data
export default function LeaderboardPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Gyan Pravah Leaderboards",
    "description": "Compete with players across India",
    "url": "https://gyanpravah.com/leaderboard"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Page content */}
    </>
  )
}
```

---

## 📊 Summary

### What You'll Build

1. **Strapi Backend:**
   - Leaderboard Entry collection
   - Custom controllers for filtering and mastery
   - API endpoints with proper permissions

2. **Next.js Frontend:**
   - 4 main pages (Home, City, Topic, Mastery)
   - 8+ reusable components
   - Submit score modal
   - Beautiful, intuitive UI

3. **Features:**
   - City-based rankings
   - Topic/subtopic rankings
   - Expert mode filtering
   - Time range filtering (All-time, Monthly, Weekly, Daily)
   - Olympic-style mastery leaderboard
   - Medal system (Gold, Silver, Bronze)
   - Tie-breaking by reaction time
   - User highlighting
   - Auto-scroll to user position

### Estimated Timeline

- **Phase 1 (Strapi):** 2-3 hours
- **Phase 2 (Next.js API):** 1-2 hours
- **Phase 3 (Components):** 4-6 hours
- **Phase 4 (Pages):** 3-4 hours
- **Testing & Polish:** 2-3 hours

**Total:** 12-18 hours

### Key Success Factors

1. **Simple Navigation** - Clear paths to all leaderboard types
2. **Smart Defaults** - Auto-select user's city and last played topic
3. **Visual Hierarchy** - Most important info stands out
4. **Performance** - Fast loading with caching
5. **Mobile-First** - Touch-optimized for mobile users
6. **Gamification** - Medals, badges, celebrations
7. **Design System** - Consistent with Gyan Pravah brand

---

**Last Updated:** November 15, 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

For questions or clarifications, refer to the specific sections above or consult the main documentation at `docs/README.md`.
