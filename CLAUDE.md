# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**React Native Training Tools** is a cross-platform mobile application for cognitive and reaction training. The app features two main games (Colors and Chain Calculator) with P2P lobby functionality for multi-device coordination.

- **Colors (Farben):** Stroop effect reaction training with voice control via microphone
- **Chain Calculator (Kettenrechner):** Mental arithmetic under time pressure
- **Lobby System:** Multi-device P2P remote control via Bluetooth/Wi-Fi using Expo Nearby Connections

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Expo Go)
npm start

# Android development (specific devices)
npm run android:pixel      # Pixel 7
npm run android:pad        # Tablet (2410CRP4CG)
npm run android:oppo       # OPPO (CPH2399)
npm run android:all        # All connected devices

# Web development
npm run web

# Production build (outputs to android/app/build/outputs/apk/release/app-release.apk)
npm run build:android

# Code quality
npm run lint               # Check for issues
npm run lint:fix           # Auto-fix issues
npm run format             # Format all files
npm run format:check       # Check formatting

# Testing
npm test                   # Run all tests
npm run test:watch         # Watch mode
```

## Architecture Overview

### Entry Flow
```
index.ts → App.tsx → ErrorBoundary → LobbyProvider → NavigationContainer → Stack Navigator
```

### Technology Stack
- **Framework:** React Native 0.81.5 with Expo SDK 54
- **Language:** TypeScript 5.9.2 (strict mode)
- **Navigation:** React Navigation v7 (Native Stack)
- **State Management:** React Context + Custom Hooks
- **P2P Communication:** Expo Nearby Connections

### Directory Structure
```
reactnative/
├── App.tsx                    # Navigation root with ErrorBoundary
├── index.ts                   # Entry point
├── constants.ts               # Tool definitions and color data
├── types.ts                   # Core TypeScript types
├── types/navigation.ts        # Navigation types
│
├── screens/                   # Feature screens
│   ├── HomeScreen.tsx         # Tool grid navigation
│   ├── ColorsScreen.tsx       # Color reaction training
│   ├── ChainCalculatorScreen.tsx  # Mental math game
│   ├── LobbyScreen.tsx        # Multi-device lobby
│   ├── colors/                # Extracted Colors components
│   ├── chain-calculator/      # Extracted Chain Calculator components
│   └── lobby/                 # Extracted Lobby components
│
├── components/                # Reusable UI primitives
│   ├── Button.tsx             # Custom button with variants
│   ├── Card.tsx               # Generic card component
│   ├── Toggle.tsx             # Toggle switch
│   ├── StepInput.tsx          # Number input with stepper
│   ├── Slider.tsx            # Custom slider
│   ├── Layout.tsx             # Layout helpers
│   ├── ErrorBoundary.tsx      # Error boundary wrapper
│   ├── FullscreenOverlay.tsx  # Fullscreen overlay
│   └── AudioLevelBar.tsx      # Audio visualization
│
├── hooks/                     # Business logic
│   ├── useNearbyLobby.ts      # P2P connection management
│   ├── useAudio.ts            # Sound playback
│   ├── useMicrophone.ts       # Voice control
│   └── useLocalStorage.ts     # Persistent settings
│
├── context/                   # Global state
│   └── LobbyContext.tsx       # Multi-device coordination
│
└── __tests__/                 # Test files
```

### Key Patterns

**Game State Pattern:**
```typescript
enum GameState {
    CONFIG = 'CONFIG',      // Settings form
    PLAYING = 'PLAYING',    // Active game
    FINISHED = 'FINISHED',  // Results
    PENDING = 'PENDING'     // Awaiting input
}
```

**Screen Organization** (for complex screens):
```
ScreenName.tsx (main, state router)
    ├── useScreenGame.ts (game logic hook)
    ├── [State]View.tsx (per-game-state UI)
    ├── [Feature]View.tsx (feature-specific UI)
    └── styles.ts (shared styles)
```

## P2P Protocol

Devices communicate via JSON messages through Expo Nearby Connections:

- `device_info`: Initial handshake `{ type, role, name, id }`
- `command`: Remote control `{ type, name, class, timestamp }`
- `game_state`: Sync state `{ type, state: { state, game } }`
- `settings`: Settings broadcast `{ type, backToWhite, duration }`

When adding new message types:
1. Define the type in `types.ts`
2. Add validation in `hooks/useNearbyLobby.ts`
3. Handle in the relevant screen

## Configuration

- **TypeScript:** Strict mode, extends `expo/tsconfig.base`
- **Testing:** Jest with `jest-expo` preset, React Native Testing Library
- **Linting:** ESLint with Expo config and Prettier integration
- **Prettier:** Single quotes, semicolons, 2-space tabs, 100 char line width

## Where to Look

- Navigation setup: `App.tsx`
- Tools list and metadata: `constants.ts`
- Colors game: `screens/ColorsScreen.tsx`
- Chain Calculator game: `screens/ChainCalculatorScreen.tsx`
- Lobby UI + flow: `screens/LobbyScreen.tsx`
- P2P stack: `hooks/useNearbyLobby.ts`
- Audio + mic: `hooks/useAudio.ts`, `hooks/useMicrophone.ts`
- Shared types: `types.ts`, `types/navigation.ts`

## Common Pitfalls

- **Nearby Connections permissions** are required on Android; verify `app.json` if adding new P2P features
- **AsyncStorage is not encrypted**; avoid storing sensitive data
- **P2P messages are unvalidated**; new message types should be validated in `useNearbyLobby.ts` and typed in `types.ts`

## Safe Change Map

- **UI tweaks:** `components/`, `screens/`
- **Game logic:** Relevant screen + related hooks
- **Protocol changes:** `hooks/useNearbyLobby.ts` + `types.ts` + screen handler

## Adding New Tools

1. Add tool definition to `constants.ts`
2. Create screen in `screens/`
3. Add route in `App.tsx`
4. Extract components to subdirectory if complex
5. Add tests in `__tests__/`
