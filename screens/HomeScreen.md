# Home Screen

Tool grid navigation screen. Lists all available training tools with quick access buttons.

## Structure

```
HomeScreen.tsx (254 lines, self-contained)
├── ToolCard component (memoized, lines 10-93)
├── HomeScreen main (lines 95-152)
└── styles (lines 154-253)
```

## Components

### ToolCard
Memoized component for each tool card.
- **Props:** `tool`, `accentColor`, `onToolPress`, `onPressDisplay`, `onPressController`
- **Features:**
  - Pressable with accessibility labels
  - Icon + title + description
  - Either tags display OR action buttons (for Colors tool)
  - Special Display/Controller buttons for Colors tool

### HomeScreen
Main container with ScrollView.
- **Renders:** Grid of `ToolCard` components from `TOOLS` constant
- **Accent colors:** Mapped from tailwind classes to hex values
- **Navigation:** Uses `@react-navigation/native`

## Data Source

Tools defined in `constants.ts`:

```typescript
export const TOOLS: Tool[] = [
    { id: 'chain-calc', name: 'Kettenrechner', ... },
    { id: 'colors', name: 'Farben', ... },
    // ...
];
```

## Navigation Paths

| Tool ID | Path |
|---------|------|
| `chain-calc` | `ChainCalculator` |
| `colors` | `Colors` (or Lobby with role) |

## Special Behavior: Colors Tool

The Colors tool has two quick-action buttons:
- **Display:** Navigates to Lobby with `initialRole: 'display'`
- **Controller:** Navigates to Lobby with `initialRole: 'controller'`

## Performance Optimizations

1. `memo` on ToolCard prevents unnecessary re-renders
2. `useMemo` for accent color mapping
3. `useCallback` for all navigation handlers
4. Accessibility labels for screen readers

## Why Not Refactored?

HomeScreen was kept as-is because:
- Reasonable size (254 lines)
- Already has separated ToolCard component
- Single responsibility (tool grid)
- No complex state management
- Styles are screen-specific

## Modifying

**Add new tool:** Edit `TOOLS` in `constants.ts`
**Change card layout:** Edit `ToolCard` component
**Add quick actions:** Add conditional rendering in ToolCard
**Change accent colors:** Update `accentColors` mapping
