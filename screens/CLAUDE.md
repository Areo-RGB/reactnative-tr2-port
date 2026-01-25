# Screens Directory

React Native screens for the training app. Each screen may have a subdirectory with extracted components.

## Structure

```
screens/
├── HomeScreen.tsx                 # Tool grid (254 lines, kept as-is)
├── ChainCalculatorScreen.tsx      # Main entry point (125 lines)
│   └── chain-calculator/          # Extracted components
│       ├── useChainCalculatorGame.ts
│       ├── PlayingView.tsx
│       ├── PendingView.tsx
│       ├── FinishedView.tsx
│       ├── ConfigView.tsx
│       ├── Numpad.tsx
│       └── styles.ts
├── ColorsScreen.tsx               # Main entry point (211 lines)
│   └── colors/                    # Extracted components
│       ├── useColorsGame.ts
│       ├── PlayingOverlay.tsx
│       ├── ColorsConfigView.tsx
│       ├── MicSettingsCard.tsx
│       └── styles.ts
└── LobbyScreen.tsx                # Main entry point (164 lines)
    └── lobby/                     # Extracted components
        ├── RoleSelector.tsx
        ├── BroadcastControls.tsx
        ├── DisplayArea.tsx
        ├── DeviceCard.tsx
        ├── Back2WhiteModal.tsx
        ├── SettingsButton.tsx
        └── styles.ts
```

## Screen Overview

| Screen | Purpose | Lines | Refactored |
|--------|---------|-------|------------|
| `HomeScreen` | Tool grid navigation | 254 | No |
| `ChainCalculatorScreen` | Mental math training | 125 | Yes |
| `ColorsScreen` | Stroop reaction training | 211 | Yes |
| `LobbyScreen` | Multi-device lobby | 164 | Yes |

## Refactoring Pattern

Each refactored screen follows this pattern:

```
ScreenName.tsx (main, state router)
    ├── use[Screen]Game.ts (game logic hook)
    ├── [State]View.tsx (per-game-state UI)
    ├── [Feature]View.tsx (feature-specific UI)
    ├── [Reusable].tsx (shared components)
    └── styles.ts (shared styles)
```

## Game States (Shared)

```typescript
enum GameState {
    CONFIG = 'CONFIG',      // Settings form
    PLAYING = 'PLAYING',    // Active game
    FINISHED = 'FINISHED',  // Results
    PENDING = 'PENDING'     // Awaiting input
}
```

## Common Patterns

1. **Hook for logic:** Game state and timers isolated in custom hooks
2. **View components:** Dumb UI components receiving props
3. **State router:** Main screen renders different views based on `GameState`
4. **Shared styles:** One `styles.ts` per screen directory
5. **Index exports:** Each directory has `index.ts` for clean imports

## Adding a New Screen

1. Create main screen file: `screens/NewScreen.tsx`
2. If complex, create subdirectory:
   ```
   screens/
   ├── NewScreen.tsx
   └── new-screen/
       ├── index.ts
       ├── useNewGame.ts
       ├── PlayingView.tsx
       ├── ConfigView.tsx
       └── styles.ts
   ```
3. Add route in `App.tsx`
4. Add tool to `TOOLS` in `constants.ts`

## See Also

- `screens/chain-calculator/CLAUDE.md` - Chain Calculator details
- `screens/colors/CLAUDE.md` - Colors screen details
- `screens/lobby/CLAUDE.md` - Lobby details
