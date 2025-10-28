---
inclusion: always
---

# Gyan Pravah Design System - Mandatory Rules

## 🚨 CRITICAL DESIGN RULES - NEVER BREAK THESE

### 1. NO GRADIENTS POLICY
**STRICTLY FORBIDDEN:**
- `bg-gradient-*` classes (linear, radial, conic)
- `from-*`, `via-*`, `to-*` gradient utilities
- Any CSS gradients in custom styles
- Glassmorphism or backdrop blur effects

**USE INSTEAD:**
- Solid colors from the approved palette
- Flat design with clean color blocks
- Single background colors only

### 2. APPROVED COLOR PALETTE ONLY

**Primary Colors:**
- Primary Purple: `#8B7FC8` (`bg-[#8B7FC8]`)
- Dark Purple: `#6B5FA8` (`bg-[#6B5FA8]`)
- Light Purple: `#B4A5E8` (`bg-[#B4A5E8]`)

**Accent Colors:**
- Correct Green: `#4ADE80` (`bg-green-400`)
- Incorrect Red: `#F87171` (`bg-red-400`)
- Warning Yellow: `#FBBF24` (`bg-yellow-400`)
- Neutral Gray: `#D1D5DB` (`bg-gray-300`)
- White: `#FFFFFF` (`bg-white`)

**Topic Category Colors:**
- Nadi (Rivers): `#3B82F6` (`bg-blue-500`)
- Shastras: `#F59E0B` (`bg-amber-500`)
- Granth: `#8B5CF6` (`bg-violet-500`)
- Bhagvan: `#EF4444` (`bg-red-500`)
- Utsav: `#10B981` (`bg-emerald-500`)
- Dham: `#F97316` (`bg-orange-500`)
- Sant: `#6366F1` (`bg-indigo-500`)

### 3. COMPONENT STYLING RULES

**Buttons:**
- Solid background colors only
- Border radius: `rounded-xl` (12px) or `rounded-lg` (8px)
- No shadows or gradients
- Hover: darken the solid color

**Cards:**
- White background (`bg-white`)
- Rounded corners: `rounded-2xl` (16px) or `rounded-xl` (12px)
- No shadows (flat design)
- Solid border colors if needed

**Text:**
- Use Poppins font family
- Proper contrast ratios (4.5:1 minimum)
- No gradient text effects

### 4. ANIMATION GUIDELINES
- Keep animations under 300ms
- Use `ease-in-out` timing
- No complex 3D transforms
- Simple scale, fade, slide animations only

### 5. SPACING SYSTEM
Use consistent spacing based on 4px grid:
- `space-1` (4px), `space-2` (8px), `space-4` (16px)
- `space-6` (24px), `space-8` (32px), `space-12` (48px)

## ❌ FORBIDDEN PATTERNS

1. **Gradient backgrounds** - Use solid colors
2. **Glassmorphism** - Use solid white cards
3. **Neumorphism** - Use flat design
4. **Complex shadows** - No shadows at all
5. **Trendy AI effects** - Keep it clean and simple

## ✅ APPROVED PATTERNS

1. **Solid color backgrounds** with proper contrast
2. **Flat white cards** with rounded corners
3. **Clean typography** with Poppins font
4. **Simple animations** for user feedback
5. **Cultural color coding** for topics

## ENFORCEMENT
- All AI assistants must follow these rules
- Any gradient usage should be immediately flagged and corrected
- Refer to `.kiro/docs/design-system.md` for complete specifications
- When in doubt, choose the simpler, flatter design option

## EXAMPLES OF CORRECT USAGE

```tsx
// ✅ CORRECT - Solid colors
<div className="bg-[#8B7FC8] text-white rounded-xl p-4">
  <button className="bg-green-400 text-white rounded-lg px-4 py-2">
    Correct Answer
  </button>
</div>

// ❌ WRONG - Gradients
<div className="bg-gradient-to-r from-purple-500 to-pink-500">
  <button className="bg-gradient-to-br from-green-400 to-blue-500">
    Wrong Style
  </button>
</div>
```

Remember: **Flat, solid, clean** - that's the Gyan Pravah way!