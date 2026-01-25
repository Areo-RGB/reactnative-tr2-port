# Colors Screen

Stroop-effect reaction training with color flashing. Supports local auto-interval mode and remote lobby-controlled mode.

## Architecture

```
ColorsScreen.tsx (211 lines)
    ↓
useColorsGame hook (game logic)
    ↓
┌─────────────────────────────────────────────┐
│  PlayingOverlay (fullscreen color display)   │
│  ColorsConfigView (settings form)            │
└─────────────────────────────────────────────┘
```

## Components

### Main Screen: `ColorsScreen.tsx`
- **Role:** Orchestrator for local + remote game modes
- **Manages:** Game state, remote lobby integration, settings persistence
- **Two modes:**
  - **Local:** Auto-interval or sound-controlled color changes
  - **Remote:** Receives colors from lobby controller

### Hook: `useColorsGame.ts`
Game state and timer management.
- **State:** `currentColor`, `step`, `timeLeft`, `triggerCount`, `waitingForSound`, `intervalRef`
- **Functions:** `nextColor()`, `handleMicTrigger()`, `reset()`, `setCurrentColor()`
- **Note:** `intervalRef` is exposed for parent to manage timer lifecycle

### View Components

| Component | Purpose |
|-----------|---------|
| `PlayingOverlay.tsx` | Fullscreen color overlay with step/counter display |
| `ColorsConfigView.tsx` | Settings form (mode, interval, infinite, audio) |
| `MicSettingsCard.tsx` | Microphone threshold + cooldown controls |

### Shared: `styles.ts`
All screen styles.

## Game Modes

### Auto Interval Mode (Local)
- Colors change every `intervalMs`
- Runs for `limitSteps` or infinite
- No microphone needed

### Sound Control Mode (Local)
- Requires microphone trigger to advance
- `waitingForSound` state shows prompt
- Runs for `totalDurationSec`

### Remote Mode (Lobby)
- `isRemote` prop from navigation
- Colors received via `useLobby()` context
- No local timer
- Auto Back2White revert supported

## State Flow

```
CONFIG → [Start] → PLAYING → [Exit] → CONFIG
                                ↓
                          (Back2White)
                                ↓
                            White
```

## Remote Integration

ColorsScreen integrates with `LobbyContext`:
- `joinLobby()` - on mount if `isRemote`
- `setMyRole('display')` - for remote mode
- `lastCommand` - receives `{ name, class, timestamp }`
- `backToWhiteSettings` - auto-revert to white

## Microphone Integration

Uses `useMicrophone()` hook when sound control enabled:
- `threshold` - audio level to trigger (1-100)
- `cooldown` - minimum time between triggers
- `active` - only when PLAYING + sound mode

## Modifying

**Game timing:** `useColorsGame.ts` + interval effect in main screen
**UI:** `PlayingOverlay.tsx` or `ColorsConfigView.tsx`
**Mic controls:** `MicSettingsCard.tsx`
