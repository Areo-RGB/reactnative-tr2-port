# Chain Calculator Screen

A mental math training game that challenges users to track a running total while operations flash on screen.

## Architecture

```
ChainCalculatorScreen.tsx (125 lines)
    ↓
useChainCalculatorGame hook (game logic)
    ↓
┌─────────────────────────────────────────────┐
│  PlayingView  │  PendingView  │  FinishedView │
│  (PLAYING)    │  (PENDING)    │  (FINISHED)   │
└─────────────────────────────────────────────┘
    ↓
ConfigView (CONFIG)
```

## Components

### Main Screen: `ChainCalculatorScreen.tsx`
- **Role:** State router and coordinator
- **Manages:** Game state, user answer, settings persistence
- **Delegates to:** View components based on `GameState`

### Hook: `useChainCalculatorGame.ts`
Game logic isolation for testability.
- **State:** `currentStep`, `displayValue`, `runningTotal`, `history`, `displayPhase`, `countdownValue`, `currentOperation`
- **Functions:** `generateOperation()`, `reset()`
- **Effect:** Manages countdown, operation display, and total phase timers

### View Components

| Component | State | Purpose |
|-----------|-------|---------|
| `PlayingView.tsx` | PLAYING | Shows operation + countdown progress bar |
| `PendingView.tsx` | PENDING | Shows `?` prompt + numpad for answer input |
| `FinishedView.tsx` | FINISHED | Shows result, history, retry/settings options |
| `ConfigView.tsx` | CONFIG | Settings form (speed, steps, infinite mode, audio) |
| `Numpad.tsx` | - | Reusable 0-9 number pad with clear/submit |

### Shared: `styles.ts`
All screen styles in one place. Import with `import { styles } from './styles';`.

## State Flow

```
CONFIG → [Start] → PLAYING → [Done] → PENDING → [Submit] → FINISHED
                    ↓                                            ↓
                 [Cancel]                                    [Settings]
                    ↓                                            ↓
                 CONFIG                                       CONFIG
```

## Game States (enum)

| State | Description |
|-------|-------------|
| CONFIG | Settings form |
| PLAYING | Operations flashing with countdown |
| PENDING | User entering answer |
| FINISHED | Results shown |

## Key Patterns

1. **Hook for logic:** `useChainCalculatorGame` isolates timers and game state
2. **View components are dumb:** Receive props, render UI, call callbacks
3. **Single source of truth:** Settings in `useLocalStorage`
4. **Cleanup:** All intervals cleared in effect returns

## Modifying Game Logic

Edit `useChainCalculatorGame.ts`:
- `generateOperation()` - change operation generation
- `useEffect` - adjust timing/phases
- `reset()` - change reset behavior

## Adding UI Changes

Edit the relevant view component:
- `PlayingView` - countdown/operation display
- `PendingView` - numpad layout
- `FinishedView` - results/history
- `ConfigView` - settings form
