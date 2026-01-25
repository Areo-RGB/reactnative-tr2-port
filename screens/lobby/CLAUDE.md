# Lobby Screen

Nearby/local network lobby for multi-device color control. Connects controller devices to display devices.

## Architecture

```
LobbyScreen.tsx (164 lines)
    ↓
┌─────────────────────────────────────────────┐
│  RoleSelector      │  BroadcastControls      │
│  DisplayArea       │  DeviceCard             │
│  Back2WhiteModal   │  SettingsButton         │
└─────────────────────────────────────────────┘
```

## Components

### Main Screen: `LobbyScreen.tsx`
- **Role:** Lobby coordinator and device list manager
- **Manages:** Role selection, Back2White settings, device list rendering
- **Integrates:** `useLobby()` context for Nearby connections

### View Components

| Component | Purpose |
|-----------|---------|
| `RoleSelector.tsx` | Display/Controller role toggle |
| `BroadcastControls.tsx` | 4-color broadcast buttons (sends to all displays) |
| `DisplayArea.tsx` | Shows received color for display role |
| `DeviceCard.tsx` | Single device in list with individual controls |
| `Back2WhiteModal.tsx` | Settings modal for auto-revert feature |
| `SettingsButton.tsx` | Triggers Back2White modal |

### Shared: `styles.ts`
All screen styles.

## Roles

| Role | Description | UI Shown |
|------|-------------|----------|
| **Display** | Receives colors, shows fullscreen | `DisplayArea`, device list |
| **Controller** | Sends colors to devices | `BroadcastControls`, individual device controls |

## Color Broadcasting

### Broadcast (All Devices)
```tsx
handleSendColor('Red', 'bg-red-500')
```

### Individual Device
```tsx
handleSendColor('Red', 'bg-red-500', deviceId)
```

## Back2White Feature

Auto-reverts displays to white after a set duration (for remote mode).

- **Enabled via:** `backToWhiteEnabled` (localStorage)
- **Duration:** `backToWhiteDuration` (seconds)
- **Broadcast:** `sendSettings()` pushes to all displays
- **Display logic:** Handled in `ColorsScreen` remote mode

## Device List

FlatList rendering all connected devices:
- Filtered by role for section title
- Controller sees individual controls per display
- Display shows list only (no controls)

## Color Mapping

```tsx
const colorMap = {
  'bg-white': '#ffffff',
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
};
```

## Navigation Flow

```
HomeScreen → Lobby (choose role)
    ↓
Controller → [broadcast color] → Display (shows color)
    ↓
Display → [auto-navigate] → ColorsScreen (fullscreen)
```

## Lobby Context Integration

Uses `useLobby()` for:
- `CLIENT_ID` - unique device identifier
- `devices` - list of connected devices
- `myRole` - current role (display/controller)
- `joinLobby()` - enter lobby on mount
- `sendCommand()` - broadcast color
- `sendSettings()` - broadcast Back2White settings
- `lastCommand` - received color (for display)
- `error` - connection errors

## Modifying

**Role UI:** `RoleSelector.tsx`
**Broadcast colors:** `BroadcastControls.tsx` (COLORS array)
**Device card:** `DeviceCard.tsx`
**Settings modal:** `Back2WhiteModal.tsx`
