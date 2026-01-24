# CLAUDE.md - AI Assistant Guide for reactnative-tr2-port

> **Last Updated**: 2026-01-24
> **Project Version**: 1.0.0
> **React Native Version**: 0.81.5
> **Expo SDK**: ~54.0.32

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Concepts & Patterns](#key-concepts--patterns)
5. [Development Workflow](#development-workflow)
6. [Code Conventions](#code-conventions)
7. [Important Files Reference](#important-files-reference)
8. [Common Development Tasks](#common-development-tasks)
9. [Multiplayer Architecture](#multiplayer-architecture)
10. [Testing & Building](#testing--building)
11. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**reactnative-tr2-port** is a React Native mobile application built with Expo that provides **multiplayer training tools** for cognitive exercises. The app features two main games:

1. **Colors (Farben)** - Reaction training with Stroop effect and audio control
2. **Chain Calculator (Kettenrechner)** - Mental arithmetic under time pressure

### Key Features

- **Local & Remote Gameplay**: Play solo or sync with nearby devices
- **Peer-to-Peer Multiplayer**: Bluetooth/WiFi Direct via Expo Nearby Connections
- **Audio Integration**: Beep sounds and microphone-based controls
- **Accessibility First**: Full German accessibility labels and WCAG compliance
- **Modern React Patterns**: Hooks, Context API, TypeScript, functional components
- **Multi-Device Deployment**: Scripts for deploying to multiple Android devices simultaneously

### Target Platforms

- **Primary**: Android (with multi-device deployment support)
- **Secondary**: iOS, Web (via Expo)
- **Development**: Expo Go for rapid testing

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI framework (latest stable) |
| **React Native** | 0.81.5 | Native mobile platform |
| **Expo** | ~54.0.32 | Development platform & tooling |
| **TypeScript** | ~5.9.2 | Type safety & developer experience |

### Key Dependencies

#### Navigation
- `@react-navigation/native`: ^7.1.28
- `@react-navigation/native-stack`: ^7.10.1
- `react-native-screens`: ~4.16.0
- `react-native-safe-area-context`: ~5.6.0

#### Multimedia
- `expo-av`: ~16.0.8 (audio playback)
- `expo-device`: ~8.0.10 (device information)

#### Multiplayer (Critical)
- `expo-nearby-connections`: ^1.0.0 (Bluetooth/WiFi P2P)

#### UI Components
- `lucide-react-native`: ^0.562.0 (icon library)
- `@react-native-community/slider`: 5.0.1
- `expo-linear-gradient`: ~15.0.8

#### State & Storage
- `@react-native-async-storage/async-storage`: 2.2.0
- `react-freeze`: ^1.0.4
- `react-native-reanimated`: ~4.1.1

### Build Tools

- **Babel**: babel-preset-expo with react-native-reanimated plugin
- **Metro**: Custom config to exclude native build directories
- **Gradle**: Android release builds

---

## Project Structure

```
/home/user/reactnative-tr2-port/
│
├── 📱 Entry Points
│   ├── index.ts                    # Root component registration
│   └── App.tsx                     # Main app with navigation & providers
│
├── 🎨 Screens (Feature Modules)
│   ├── HomeScreen.tsx              # Main menu with tool cards
│   ├── ColorsScreen.tsx            # Color reaction training (17.6 KB)
│   ├── ChainCalculatorScreen.tsx   # Mental arithmetic game (20.4 KB)
│   └── LobbyScreen.tsx             # Multiplayer coordination (19.3 KB)
│
├── 🧩 Components (Reusable UI)
│   ├── Button.tsx                  # 3 variants: primary, secondary, outline
│   ├── Card.tsx                    # Dark-themed container
│   ├── Layout.tsx                  # Screen wrapper with header & back button
│   ├── Toggle.tsx                  # Switch component
│   ├── StepInput.tsx               # +/- increment control
│   ├── Slider.tsx                  # Range input
│   ├── AudioLevelBar.tsx           # Microphone level visualization
│   ├── FullscreenOverlay.tsx       # Immersive display mode
│   └── ErrorBoundary.tsx           # Error handling boundary
│
├── 🪝 Hooks (Custom Logic)
│   ├── useNearbyLobby.ts           # P2P device discovery & messaging (13.5 KB)
│   ├── useMicrophone.ts            # Audio level detection
│   ├── useAudio.ts                 # Sound playback management
│   └── useLocalStorage.ts          # AsyncStorage wrapper
│
├── 🌐 Context (Global State)
│   └── LobbyContext.tsx            # Multiplayer state provider
│
├── 📐 Types
│   ├── types.ts                    # Core type definitions
│   └── types/navigation.ts         # Navigation type safety
│
├── 🎯 Configuration
│   ├── constants.ts                # TOOLS array, COLORS_DATA
│   ├── app.json                    # Expo config (permissions, plugins)
│   ├── package.json                # Dependencies & scripts
│   ├── tsconfig.json               # TypeScript strict mode
│   ├── babel.config.js             # Babel with Expo preset
│   └── metro.config.js             # Metro bundler config
│
└── 🎨 Assets
    ├── icon.png
    ├── splash-icon.png
    ├── adaptive-icon.png
    └── favicon.png
```

---

## Key Concepts & Patterns

### 1. Navigation Architecture

The app uses **React Navigation Native Stack** with type-safe routing:

```typescript
// Navigation Flow
Home (Main Menu)
  ├→ Colors (Local or Remote start)
  │   └→ FullscreenOverlay (during gameplay)
  ├→ ChainCalculator
  └→ Lobby
      └→ Colors (display receives remote command)

// Route Parameters (type-safe)
type RootStackParamList = {
  Home: undefined;
  Colors: { remoteStart?: boolean; clientId?: string; connectionMode?: string };
  ChainCalculator: undefined;
  Lobby: { initialRole?: 'display' | 'controller' };
};
```

### 2. State Management Strategy

#### Global State (Context API)
- **LobbyContext**: Manages multiplayer connections, device roles, game commands
- Wraps entire app in `App.tsx`
- Exposes: `devices`, `myRole`, `gameState`, connection methods

#### Local State (useState)
- Game phases: `CONFIG` → `PLAYING` → `PENDING` → `FINISHED`
- Screen-specific settings and UI state
- Timer and counter management

#### Persistent State (AsyncStorage)
- Game settings (intervals, steps, audio options)
- User preferences
- Managed via `useLocalStorage<T>` generic hook

### 3. Component Patterns

All components follow these patterns:

```typescript
// 1. TypeScript interface for props
interface ButtonProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// 2. Functional component with React.memo
export const Button = React.memo<ButtonProps>(({ ... }) => {
  // 3. Accessibility labels
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Beschreibung"
      accessibilityHint="Was passiert beim Drücken"
      accessibilityState={{ disabled }}
    >
      {/* 4. StyleSheet for styling */}
    </Pressable>
  );
});
```

### 4. Game State Machine

Both games use similar state flow:

```typescript
enum GameState {
  CONFIG = 'CONFIG',      // User configures settings
  PLAYING = 'PLAYING',    // Game is active
  PENDING = 'PENDING',    // Waiting for trigger (Colors only)
  FINISHED = 'FINISHED'   // Game completed
}
```

### 5. Multiplayer Message Protocol

Peer-to-peer communication uses JSON text messages:

```typescript
// Message Types
type MessageType =
  | 'device_info'    // Share device name/role
  | 'command'        // Send color or game action
  | 'game_state'     // Sync game state
  | 'settings';      // Share settings

// Example: Sending a color command
sendCommand({
  type: 'command',
  command: 'setColor',
  payload: { color: 'Red' },
  timestamp: Date.now()
});
```

### 6. Custom Hook Pattern - `useNearbyLobby`

The most complex hook in the codebase:

- **Purpose**: Manages P2P device discovery and messaging
- **Permissions**: Handles Android API 31+ and 33+ permission requirements
- **Connection Queue**: Throttles connections (1.5s intervals) to prevent flooding
- **Message Routing**: Dispatches received messages to appropriate handlers
- **State Tracking**: Uses refs to avoid unnecessary re-renders

---

## Development Workflow

### Initial Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific Android device
npm run android:pixel    # Pixel 7
npm run android:pad      # Tablet (2410CRP4CG)
npm run android:oppo     # OPPO device (CPH2399)

# Run on all connected devices
npm run android:all

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Development Modes

1. **Expo Go**: Fast iteration, limited native modules
2. **Development Build**: Full native module access with expo-dev-client
3. **Production Build**: Release builds via Gradle

### Hot Reload & Fast Refresh

- **Enabled by default** in Expo development mode
- Changes to `.tsx`/`.ts` files auto-refresh
- State is preserved during most updates
- Full reload required for:
  - Native module changes
  - `app.json` modifications
  - Asset updates

---

## Code Conventions

### File Naming

- **Components**: PascalCase (`Button.tsx`, `AudioLevelBar.tsx`)
- **Hooks**: camelCase with `use` prefix (`useNearbyLobby.ts`)
- **Screens**: PascalCase with `Screen` suffix (`HomeScreen.tsx`)
- **Types**: camelCase (`types.ts`, `navigation.ts`)
- **Constants**: camelCase (`constants.ts`)

### TypeScript Guidelines

1. **Strict Mode Enabled** - All code must pass strict type checks
2. **Explicit Interfaces** - Define props interfaces for all components
3. **Generic Constraints** - Use generics where appropriate (e.g., `useLocalStorage<T>`)
4. **No `any`** - Avoid `any` type; use `unknown` if type is truly unknown
5. **Null Safety** - Use optional chaining (`?.`) and nullish coalescing (`??`)

### Styling Conventions

1. **StyleSheet API** - All styles use `StyleSheet.create()`
2. **Color Palette** - Based on Tailwind slate colors
   - Background: `#020617` (slate-950)
   - Text: `#ffffff` (white)
   - Borders: `#334155` (slate-700)
   - Accents: `#3b82f6` (blue-500), `#22c55e` (green-500), etc.
3. **Responsive Units** - Use percentage-based widths, fixed heights where needed
4. **Dark Theme First** - All UI designed for dark mode

### Accessibility Requirements

**CRITICAL**: All new features MUST include:

1. **German Labels** - All `accessibilityLabel` in German
2. **Semantic Roles** - Use `accessibilityRole` (button, switch, header)
3. **State Indicators** - Use `accessibilityState` for dynamic states
4. **Hints** - Provide `accessibilityHint` for non-obvious actions
5. **Touch Targets** - Minimum 44x44 logical pixels

Example:
```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Farben Spiel starten"
  accessibilityHint="Öffnet das Farben-Reaktionstraining"
  accessibilityState={{ disabled: false }}
>
```

### Performance Best Practices

1. **Memoization** - Use `React.memo` for components, `useMemo` for expensive computations
2. **Callback Stability** - Use `useCallback` for callbacks passed to child components
3. **Refs for Non-Rendering State** - Use `useRef` for values that shouldn't trigger re-renders
4. **Avoid Inline Functions** - Extract event handlers to stable references
5. **Lazy Loading** - Defer heavy operations until needed

---

## Important Files Reference

### Core Entry Points

| File | Purpose | Key Contents |
|------|---------|--------------|
| `index.ts` | App registration | `registerRootComponent(App)` |
| `App.tsx` | Main component | Navigation, ErrorBoundary, LobbyProvider |
| `constants.ts` | App-wide constants | `TOOLS` array, `COLORS_DATA` |
| `types.ts` | Core type definitions | `Tool`, `ColorData`, `GameState`, etc. |

### Configuration Files

| File | Purpose | Notes |
|------|---------|-------|
| `app.json` | Expo configuration | Permissions, plugins, bundle IDs |
| `package.json` | Dependencies & scripts | Multi-device Android scripts |
| `tsconfig.json` | TypeScript config | Extends Expo base, strict mode |
| `babel.config.js` | Babel config | Expo preset + reanimated plugin |
| `metro.config.js` | Metro bundler | Blocks native build dirs |

### Key Screens

| Screen | LOC | Primary Function | State Complexity |
|--------|-----|------------------|------------------|
| `ColorsScreen.tsx` | ~500 | Reaction training | High (settings, timers, remote control) |
| `ChainCalculatorScreen.tsx` | ~600 | Mental math | Medium (countdown, operations) |
| `LobbyScreen.tsx` | ~550 | Device coordination | High (connections, roles, messaging) |
| `HomeScreen.tsx` | ~150 | Main menu | Low (navigation only) |

### Critical Hooks

| Hook | LOC | Purpose | Complexity |
|------|-----|---------|------------|
| `useNearbyLobby.ts` | ~400 | P2P networking | Very High (permissions, queue, messages) |
| `useMicrophone.ts` | ~100 | Audio input | Medium (permissions, recording) |
| `useAudio.ts` | ~80 | Sound playback | Low (simple audio) |
| `useLocalStorage.ts` | ~50 | Persistence | Low (AsyncStorage wrapper) |

---

## Common Development Tasks

### Adding a New Screen

1. Create screen file in `/screens/` (e.g., `NewGameScreen.tsx`)
2. Define route params in `/types/navigation.ts`:
   ```typescript
   type RootStackParamList = {
     NewGame: { difficulty?: number };
     // ...
   };
   ```
3. Register in `App.tsx`:
   ```typescript
   <Stack.Screen name="NewGame" component={NewGameScreen} />
   ```
4. Add tool definition to `constants.ts` if applicable

### Creating a Reusable Component

1. Create component in `/components/` (e.g., `Dropdown.tsx`)
2. Define TypeScript interface for props
3. Implement with `React.memo` for performance
4. Add accessibility labels (German)
5. Use `StyleSheet.create()` for styling
6. Export as named export

### Adding a Custom Hook

1. Create hook file in `/hooks/` (e.g., `useTimer.ts`)
2. Start filename with `use` prefix
3. Use TypeScript generics if applicable
4. Handle cleanup in `useEffect` returns
5. Export as named export

### Implementing New Game Logic

1. Create screen in `/screens/`
2. Define game state enum (CONFIG, PLAYING, FINISHED)
3. Use `useLocalStorage` for settings persistence
4. Implement state machine with `useState` and `useEffect`
5. Add accessibility throughout
6. Test on physical device for performance

### Adding Multiplayer Features

1. Use `useLobbyContext()` to access multiplayer state
2. Define new message types in protocol
3. Update `useNearbyLobby` message handlers
4. Test with at least 2 physical devices
5. Handle connection failures gracefully

---

## Multiplayer Architecture

### Nearby Connections Overview

**Technology**: Expo Nearby Connections (Bluetooth + WiFi Direct on Android)

**Strategy**: `P2P_CLUSTER` - Allows multiple devices to connect freely

**Service Name**: `tr2-connections` (defined in `app.json`)

### Device Roles

```typescript
type DeviceRole = 'display' | 'controller' | 'idle';

// Display: Shows colors/numbers remotely
// Controller: Sends commands to displays
// Idle: Connected but not participating
```

### Connection Flow

```
1. User opens Lobby screen
2. App requests Bluetooth/location permissions
3. `useNearbyLobby` starts advertising & discovering
4. Nearby devices appear in device list
5. User taps device → added to connection queue
6. Queue processes connections with 1.5s throttle
7. Connected devices exchange 'device_info' messages
8. Devices can now send commands/settings/game_state
```

### Message Types & Payloads

```typescript
// Device Information
{
  type: 'device_info',
  deviceName: string,
  role: DeviceRole,
  timestamp: number
}

// Color Command (Controller → Display)
{
  type: 'command',
  command: 'setColor',
  payload: { color: string, backToWhite?: boolean, backToWhiteDelay?: number },
  timestamp: number
}

// Game State Sync
{
  type: 'game_state',
  state: GameState,
  timestamp: number
}

// Settings Sync
{
  type: 'settings',
  payload: { interval: number, steps: number, ... },
  timestamp: number
}
```

### Duplicate Detection

Messages include timestamps. Receivers track last processed timestamp per sender to ignore duplicates.

### Connection Queue Strategy

**Problem**: Simultaneous connections cause failures
**Solution**: Queue connections and process with 1.5s intervals

```typescript
// In useNearbyLobby.ts
const [connectionQueue, setConnectionQueue] = useState<string[]>([]);

useEffect(() => {
  if (connectionQueue.length > 0) {
    const endpointId = connectionQueue[0];
    connectToEndpoint(endpointId);

    // Remove from queue and wait before next
    setTimeout(() => {
      setConnectionQueue(prev => prev.slice(1));
    }, 1500);
  }
}, [connectionQueue]);
```

### Permissions Required (Android)

**API Level 31-32**:
- `BLUETOOTH_ADVERTISE`
- `BLUETOOTH_CONNECT`
- `BLUETOOTH_SCAN`
- `ACCESS_FINE_LOCATION`

**API Level 33+**:
- Above permissions
- `NEARBY_WIFI_DEVICES` (no location needed on 33+)

### Testing Multiplayer Features

**Requirements**:
- Minimum 2 physical Android devices
- Bluetooth enabled on both
- Location enabled (if API < 33)
- Same app version on all devices

**Test Scenarios**:
1. Discovery: Can devices find each other?
2. Connection: Do connections establish?
3. Messaging: Do commands arrive correctly?
4. Disconnection: Does app handle disconnects gracefully?
5. Reconnection: Can devices reconnect after disconnect?

---

## Testing & Building

### Development Testing

**Expo Go** (Quick testing):
```bash
npm start
# Scan QR code with Expo Go app
```

**Development Build** (Full features):
```bash
# First time setup
npx expo install expo-dev-client
npx expo run:android  # Builds and installs dev client

# Subsequent runs
npm start --dev-client
```

### Android Build

**Debug Build**:
```bash
npm run android         # Default to Pixel 7
npm run android:pixel   # Specific device
```

**Release Build**:
```bash
npm run build:android
# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Multi-Device Deployment

**Deploy to all connected devices**:
```bash
npm run android:all
# Uses adb to detect and deploy to all devices
```

**Manual deployment**:
```bash
# List connected devices
adb devices

# Install on specific device
adb -s <DEVICE_ID> install app-release.apk
```

### Common Issues

**Metro Bundler Not Starting**:
```bash
# Clear cache
npx expo start -c
```

**Native Module Changes Not Applied**:
```bash
# Rebuild native code
npx expo prebuild --clean
npm run android
```

**Permissions Not Working**:
1. Check `app.json` permissions array
2. Uninstall app completely
3. Reinstall with `expo run:android`
4. Manually grant permissions in Android Settings

---

## AI Assistant Guidelines

### When Reading This Codebase

1. **Always check the screen file first** - Game logic lives in screens, not components
2. **Understand the hook before modifying** - Especially `useNearbyLobby.ts` (complex)
3. **Check constants.ts for data structures** - Colors, tools, and configuration
4. **Navigation types are strict** - Respect the RootStackParamList
5. **German text is intentional** - UI and accessibility labels are in German

### Before Making Changes

✅ **DO**:
- Read existing code patterns before adding new features
- Preserve accessibility labels in German
- Test on physical devices for multiplayer features
- Use TypeScript strict mode (no `any` types)
- Follow the existing state management pattern (Context for global, useState for local)
- Add performance optimizations (memo, useCallback, useMemo)
- Handle errors gracefully with try-catch

❌ **DON'T**:
- Change the color scheme without understanding the design system
- Add English accessibility labels (use German)
- Skip testing multiplayer on physical devices
- Disable TypeScript strict mode
- Introduce new state management libraries without discussion
- Remove error boundaries
- Change the navigation structure without updating types

### Common Pitfalls to Avoid

1. **Nearby Connections Permissions**: Android 31+ requires runtime permission requests, not just manifest declarations
2. **Connection Race Conditions**: Always use the connection queue pattern
3. **State Updates in Timers**: Use refs for timer IDs to prevent memory leaks
4. **AsyncStorage Serialization**: Only strings can be stored; use JSON.stringify/parse
5. **Navigation Types**: Always update `RootStackParamList` when changing route params
6. **Accessibility**: Missing labels cause screen reader issues; test with TalkBack

### Performance Considerations

**Expensive Operations**:
- Audio recording setup (use `useMicrophone` hook)
- Nearby connections discovery (managed in `useNearbyLobby`)
- AsyncStorage reads (use `useLocalStorage` with initial value)

**Optimization Strategies**:
- Memoize color mappings (see `ColorsScreen.tsx`)
- Use refs for timer/interval IDs
- Debounce user inputs for settings
- Lazy load screens with React.lazy (not yet implemented)

### Debugging Tips

**React Native Debugging**:
```bash
# View logs
npx react-native log-android
npx react-native log-ios

# Inspect element (dev menu)
# Shake device or Ctrl+M (Android) / Cmd+D (iOS)
```

**Expo Debugging**:
```bash
# Start with debugging
npx expo start --dev-client

# Open dev tools
# Press 'j' in terminal
```

**Nearby Connections Debugging**:
- Check Bluetooth is enabled
- Verify location permissions (API < 33)
- Use console.log in message handlers
- Check device list updates in LobbyScreen

### Code Review Checklist

Before submitting changes, verify:

- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] All new components have accessibility labels (German)
- [ ] New screens are registered in navigation types
- [ ] State management follows existing patterns
- [ ] Multiplayer features tested on 2+ devices
- [ ] No hardcoded strings (use constants or state)
- [ ] Error handling is comprehensive
- [ ] Performance optimizations applied (memo, useCallback)
- [ ] No console.log statements in production code
- [ ] Git commit messages are descriptive

---

## Project-Specific Context

### Why "TR2 Port"?

This is a React Native port of an original training tool application. The "TR2" refers to the second version of the training tools. Hence, some features are commented out in `constants.ts` as they haven't been ported yet.

### Design Philosophy

1. **Simplicity First**: Minimal UI, maximum focus on training tasks
2. **Accessibility**: Full screen reader support for inclusive design
3. **Offline First**: All features work without internet (except initial install)
4. **Local Multiplayer**: P2P connections avoid server costs and latency
5. **German Language**: Target audience is German-speaking users

### Future Expansion Areas

Based on commented code in `constants.ts`:

- **Sound Counter**: Event counting based on audio level
- Additional tools to be ported from original version

### Technical Debt & Known Issues

1. **No automated tests** - Consider adding Jest/React Native Testing Library
2. **Hardcoded device IDs** - In package.json scripts (Pixel_7, etc.)
3. **No CI/CD pipeline** - Manual builds only
4. **Limited error telemetry** - No crash reporting service integrated
5. **iOS multiplayer untested** - Nearby Connections primarily tested on Android

---

## Version History

### 1.0.0 (Current)
- Initial release with Colors and Chain Calculator games
- Multiplayer lobby with nearby connections
- Audio integration and microphone control
- Full accessibility support
- Multi-device Android deployment

---

## Additional Resources

### Expo Documentation
- [Expo SDK Reference](https://docs.expo.dev/)
- [Expo Nearby Connections](https://docs.expo.dev/versions/latest/sdk/nearby-connections/)

### React Navigation
- [React Navigation Docs](https://reactnavigation.org/)
- [Type Checking](https://reactnavigation.org/docs/typescript/)

### React Native
- [React Native Docs](https://reactnative.dev/)
- [Performance Optimization](https://reactnative.dev/docs/performance)

### Accessibility
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Android TalkBack Testing](https://support.google.com/accessibility/android/answer/6283677)

---

## Contact & Support

For questions about this codebase or to contribute:

1. Review this CLAUDE.md document thoroughly
2. Explore the codebase structure outlined above
3. Test changes on physical devices when applicable
4. Follow the code conventions and patterns established

**Happy coding!** 🚀
