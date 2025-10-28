# Gyan Pravah - Design System Document

## Design Philosophy

Gyan Pravah's design should feel **playful, engaging, and culturally authentic** while maintaining clarity and usability. The aesthetic draws inspiration from successful quiz apps like QuizUp, combined with Indian cultural sensibilities and a modern, clean interface optimized for quick gameplay.

## Core Design Principles

1. **Flat Design, No Gradients:** Use solid, vibrant colors. Avoid gradients, glassmorphism, or overly trendy effects that make the app look generic or AI-generated.

2. **Cartoony & Playful:** Rounded corners, friendly illustrations, character-based elements (avatars, icons). The app should feel fun and approachable, not academic or sterile.

3. **Clean Quiz Focus:** Every screen prioritizes the quiz experience. Remove visual clutter, prioritize readability, and ensure fast comprehension of questions and options.

4. **Cultural Authenticity:** Use colors, icons, and visual elements that resonate with Indian spiritual and cultural aesthetics without being stereotypical.

5. **Mobile-First:** Design for thumb-friendly interactions, large tap targets, and quick glances. Desktop is secondary.

6. **Consistent & Modular:** Build a design system with reusable components. Every button, card, and modal should follow the same visual language.

## Color Palette

### Primary Colors (Inspired by Reference Image)
- **Primary Purple:** `#8B7FC8` (Main brand color, backgrounds)
- **Dark Purple:** `#6B5FA8` (Headers, important UI elements)
- **Light Purple:** `#B4A5E8` (Secondary backgrounds, cards)

### Accent Colors (For Game Elements)
- **Correct Green:** `#4ADE80` (Correct answers, success states)
- **Incorrect Red:** `#F87171` (Wrong answers, error states)
- **Warning Yellow:** `#FBBF24` (Timers, caution states, bonus rounds)
- **Neutral Gray:** `#D1D5DB` (Disabled states, inactive elements)
- **White:** `#FFFFFF` (Question cards, answer options, text backgrounds)

### Text Colors
- **Primary Text:** `#1F2937` (Main content on white backgrounds)
- **Secondary Text:** `#6B7280` (Helper text, descriptions)
- **Light Text:** `#FFFFFF` (Text on colored backgrounds)

### Topic Category Colors (For Visual Distinction)
- **Nadi (Rivers):** `#3B82F6` (Blue - water)
- **Shastras (Scriptures):** `#F59E0B` (Orange - ancient wisdom)
- **Granth (Epics):** `#8B5CF6` (Purple - royal epics)
- **Bhagvan (Deities):** `#EF4444` (Red - divine energy)
- **Utsav (Festivals):** `#10B981` (Green - celebration)
- **Dham (Pilgrimage):** `#F97316` (Saffron - spiritual sites)
- **Sant (Saints):** `#6366F1` (Indigo - wisdom)

## Typography

### Font Family
**Primary Font:** Poppins (Google Fonts)
- Chosen for excellent readability, modern feel, and support for Indian language scripts (Devanagari, Bengali, Tamil, etc.)
- Use weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Font Sizes (Mobile-first, rem units)
- **Heading 1:** 2rem (32px) - Bold - Page titles
- **Heading 2:** 1.5rem (24px) - SemiBold - Section headers
- **Heading 3:** 1.25rem (20px) - SemiBold - Card titles
- **Body Large:** 1.125rem (18px) - Medium - Question text
- **Body:** 1rem (16px) - Regular - Standard text
- **Body Small:** 0.875rem (14px) - Regular - Helper text
- **Caption:** 0.75rem (12px) - Regular - Labels, timestamps

### Line Heights
- Headings: 1.2
- Body text: 1.5
- Captions: 1.4

## Spacing System (Based on 4px Grid)

- **xs:** 4px (0.25rem)
- **sm:** 8px (0.5rem)
- **md:** 16px (1rem)
- **lg:** 24px (1.5rem)
- **xl:** 32px (2rem)
- **2xl:** 48px (3rem)
- **3xl:** 64px (4rem)

## Component Design Specifications

### 1. Buttons

#### Primary Button
- **Background:** Solid color (Primary Purple, Green, Red, Yellow depending on context)
- **Text:** White, Bold, 1rem
- **Padding:** 12px 24px (vertical, horizontal)
- **Border Radius:** 12px (rounded)
- **Min Height:** 48px (touch-friendly)
- **Shadow:** None (flat design)
- **Hover/Active:** Darken background by 10%

#### Secondary Button
- **Background:** White
- **Border:** 2px solid Primary Purple
- **Text:** Primary Purple, SemiBold, 1rem
- **Padding:** 12px 24px
- **Border Radius:** 12px
- **Min Height:** 48px

#### Icon Button
- **Size:** 48x48px minimum
- **Background:** Transparent or light colored circle
- **Icon:** 24x24px, centered

### 2. Cards

#### Question Card (Reference Image - Center Screen)
- **Background:** White
- **Border Radius:** 24px
- **Padding:** 24px
- **Shadow:** None (flat design)
- **Question Text:** Body Large, centered, Primary Text color
- **Category Badge:** Small rounded pill above question, topic color, white text

#### Answer Option Card
- **Background:** White
- **Border:** 2px solid Light Gray (default)
- **Border Radius:** 16px
- **Padding:** 16px
- **Min Height:** 56px
- **Text:** Body, left-aligned
- **States:**
  - Selected: Border changes to Primary Purple
  - Correct: Background changes to Correct Green, white text
  - Incorrect: Background changes to Incorrect Red, white text
  - Disabled: Background Light Gray, text muted

#### Topic Card (Home Screen)
- **Background:** Topic category color
- **Border Radius:** 20px
- **Padding:** 20px
- **Shadow:** None
- **Icon:** 48x48px, white or contrasting color
- **Title:** Heading 3, white text
- **Subtitle:** Body Small, white text with 80% opacity

#### Profile Stats Card (Left Screen in Reference)
- **Background:** White
- **Border Radius:** 16px
- **Padding:** 16px
- **Text:** Body Small, labels and values clearly distinguished
- **Charts:** Flat, solid colors matching color palette (no gradients)

### 3. Game Screen Elements (Center Screen - Reference Image)

#### Header
- **Background:** Primary Purple
- **Height:** 80px
- **Content:** Game logo centered, player avatars on left/right, scores displayed
- **Avatar Size:** 48x48px, circular, white border
- **Score Display:** Bold, white text

#### Round Indicators (Colored Circles at Top)
- **Size:** 32x32px each
- **Colors:** Red (incorrect), Green (correct), Gray (pending), Yellow (bonus)
- **Layout:** Horizontal row, 8px spacing
- **Shape:** Circles (no squares or other shapes)

#### Timer Bar
- **Background:** Light Gray
- **Fill:** Correct Green
- **Height:** 8px
- **Border Radius:** 4px (pill shape)
- **Timer Number:** Centered, bold, inside circular badge overlaying bar

#### Surrender Button
- **Style:** Small rounded button, Incorrect Red background, white text
- **Position:** Top-left corner
- **Size:** Compact, 80px x 36px

### 4. Leaderboard (Right Screen - Reference Image)

#### Leaderboard Header
- **Background:** Primary Purple
- **Avatar Display:** Player avatars side-by-side, scores visible
- **Layout:** Horizontal flex, centered

#### Category Sections
- **Background:** Dark Purple cards with rounded corners
- **Padding:** 16px
- **Category Name:** Body, white text
- **Round Indicators:** Horizontal row of colored circles per category
- **Spacing:** 12px between category cards

#### Timer Display
- **Style:** Text label with timer value
- **Font:** Body Small, white text

#### Action Buttons
- **Surrender:** Red background, white text, rounded
- **Play Your Turn:** Yellow background, dark text, rounded, bold
- **Size:** Full-width or half-width depending on context
- **Position:** Bottom of screen

### 5. Profile Screen (Left Screen - Reference Image)

#### Profile Header
- **Avatar:** Large circular avatar (80x80px), centered
- **Username:** Heading 2, centered below avatar
- **Level Badge:** Small circular badge overlapping avatar (bottom-right corner)
- **Background:** Primary Purple gradient-free

#### Stats Sections
- **Card Style:** White cards with rounded corners
- **Section Headers:** Body SemiBold
- **Charts:** Pie/donut charts with flat colors
- **Progress Bars:** Horizontal bars, topic-color filled, gray background
- **Percentage Labels:** Body Small, left-aligned

### 6. Navigation

#### Bottom Navigation Bar (If Used)
- **Height:** 64px
- **Background:** White
- **Icons:** 28x28px, inactive gray, active primary purple
- **Labels:** Caption, inactive gray, active primary purple

#### Top Navigation Bar
- **Height:** 56px
- **Background:** Primary Purple
- **Back Button:** Left-aligned, white icon
- **Title:** Heading 3, white, centered
- **Action Button:** Right-aligned, white icon

### 7. Modal/Dialog

#### Coming Soon Modal
- **Background:** White
- **Border Radius:** 24px
- **Padding:** 32px
- **Icon:** 64x64px, centered, topic color
- **Title:** Heading 2, centered
- **Description:** Body, centered, gray text
- **Button:** Primary button, centered, "Got it" or "Notify Me"
- **Close:** X icon, top-right corner

## Iconography

### Style
- **Type:** Line icons with rounded ends (similar to Lucide or Heroicons)
- **Weight:** 2px stroke
- **Size:** 24x24px default, scale proportionally
- **Color:** Match text color or use solid accent colors

### Key Icons Needed
- Home, Trophy (leaderboard), User (profile), Settings
- Play, Pause, Forward, Back
- Check (correct), X (incorrect), Clock (timer)
- Share, Heart, Star (favorite)
- Question mark, Info, Lock (locked content)
- Topic icons: Water drop (Nadi), Book (Shastras), Crown (Bhagvan), etc.

## Illustrations & Graphics

### Avatar Style
- **Type:** Cartoon/illustrated style, friendly faces
- **Customization:** Hair, skin tone, accessories
- **Size:** 48x48px (small), 80x80px (profile), 120x120px (large)
- **Border:** 2-3px white border for contrast

### Placeholder Graphics
- **Empty States:** Simple line illustrations with encouraging text
- **Coming Soon:** Illustration representing the feature with playful style
- **Error States:** Friendly, non-alarming illustrations

## Animation & Motion

### Principles
- **Purposeful:** Animations should enhance understanding, not distract
- **Fast:** Keep animations under 300ms for UI feedback
- **Smooth:** Use easing functions (ease-in-out)

### Key Animations
- **Button Press:** Scale down slightly (0.95x) on tap
- **Page Transition:** Slide in from right (100ms)
- **Modal Open:** Fade in background, scale up modal (200ms)
- **Correct Answer:** Pulse green, confetti (optional)
- **Incorrect Answer:** Shake animation
- **Loading:** Spinner or progress bar (no skeleton screens unless necessary)
- **Achievement Unlock:** Pop-up from bottom with bounce effect

## Responsive Design

### Breakpoints
- **Mobile:** < 640px (primary focus)
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Design Priority
- Single column layouts
- Full-width cards with 16px horizontal padding
- Bottom-aligned primary actions
- Top-aligned navigation
- Stack elements vertically

### Tablet/Desktop Adaptations
- Two-column layouts where appropriate
- Sidebar navigation option
- Wider maximum content width (1200px)
- Horizontal action bars

## Accessibility Requirements

### Color Contrast
- Text on colored backgrounds: Minimum 4.5:1 contrast ratio
- Large text (24px+): Minimum 3:1 contrast ratio
- Interactive elements: Clearly distinguishable from non-interactive

### Touch Targets
- Minimum size: 48x48px (iOS/Android standard)
- Spacing between targets: 8px minimum

### Focus States
- Visible outline on keyboard focus (2px solid Primary Purple)
- Skip navigation for keyboard users

### Text
- Minimum font size: 14px for body text
- Line height: 1.5 for readability
- Avoid all-caps for long text (reduces readability)

## Design Don'ts (Critical Rules)

### ❌ Avoid These At All Costs:
1. **No Gradients:** No linear, radial, or conical gradients on backgrounds, buttons, or cards
2. **No Glassmorphism:** No frosted glass effects, backdrop blur, or translucent overlays
3. **No Neumorphism:** No soft shadows or 3D embossed effects
4. **No Generic AI Patterns:** Avoid overly trendy designs that scream "AI-generated"
5. **No Tiny Text:** Nothing smaller than 12px
6. **No Low Contrast:** Ensure all text is readable
7. **No Cluttered Screens:** White space is your friend
8. **No Inconsistent Spacing:** Use the spacing system consistently
9. **No Random Colors:** Stick to the defined palette
10. **No Overly Complex Animations:** Keep it simple and fast

## Component Library Structure

```
components/
├── common/
│   ├── Button/           # All button variants
│   ├── Card/             # All card variants
│   ├── Avatar/           # User avatars
│   ├── Badge/            # Labels, tags, badges
│   ├── Modal/            # Dialogs and modals
│   ├── Input/            # Form inputs
│   └── Icon/             # Icon wrapper
├── game/
│   ├── QuestionCard/     # Quiz question display
│   ├── AnswerOption/     # Answer buttons
│   ├── Timer/            # Countdown timer
│   ├── ScoreDisplay/     # Score board
│   ├── RoundIndicator/   # Round progress circles
│   └── GameHeader/       # In-game header
├── topics/
│   ├── TopicCard/        # Topic category cards
│   └── TopicList/        # Grid of topics
├── profile/
│   ├── ProfileHeader/    # User profile top section
│   ├── StatsCard/        # Statistics display
│   └── ProgressBar/      # Topic progress bars
└── leaderboard/
    ├── LeaderboardHeader/
    ├── LeaderboardRow/
    └── CategoryLeaderboard/
```

## Figma Design Tokens (If Using Figma)

### Colors
Create color styles for all palette colors

### Text Styles
Create text styles for all typography variations

### Effects
No shadows or effects (flat design)

### Components
Create reusable components matching code structure

## Reference Image Analysis

Based on the provided reference image (QuizUp-style quiz app):

### What to Replicate:
- ✅ Solid, vibrant purple background
- ✅ White question card with rounded corners
- ✅ Clean answer option cards
- ✅ Circular round indicators (red/green/gray/yellow)
- ✅ Player avatars at top with scores
- ✅ Timer bar with number display
- ✅ Simple, flat design with no gradients
- ✅ Clear visual hierarchy
- ✅ Profile screen with stats cards and progress bars
- ✅ Category-based organization on leaderboard
- ✅ Action buttons at bottom (Surrender, Play Your Turn)

### What to Adapt for Gyan Pravah:
- Use Poppins font instead of default
- Adjust colors to match our palette while keeping the flat, solid aesthetic
- Add cultural elements (icons for Indian topics)
- Ensure Hindi/Indian language script readability
- Adapt topic categories to our 7 main categories

---

**Document Version:** 1.0  
**Last Updated:** October 16, 2025  
**Reference:** QuizUp UI (reference-image.jpg)  
**Status:** Design system for MVP development