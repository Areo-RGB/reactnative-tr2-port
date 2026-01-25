# Agent Guide: React Native Training Tools

This document orients agentic AI assistants to the codebase so they can make safe,
useful changes without deep spelunking.

## Project snapshot

- App type: Expo + React Native (TypeScript)
- Purpose: cognitive training games (Colors, Chain Calculator) + P2P lobby control
- Entry points: `index.ts` -> `App.tsx`
- State: Context + custom hooks; no tests configured

## Architecture in one minute

- Screens live in `screens/` and own feature behavior.
- Reusable UI primitives live in `components/`.
- Shared logic is extracted to hooks in `hooks/`.
- Global lobby coordination lives in `context/LobbyContext.tsx`.
- App-wide constants and tool metadata are in `constants.ts`.

## Key flows

- Local play: screen state drives UI; settings persist via AsyncStorage.
- Lobby play: devices connect via Nearby Connections, then exchange JSON messages.

### P2P message types

- `device_info`: initial handshake `{ type, role, name, id }`
- `command`: remote control (e.g., color change) `{ type, name, class, timestamp }`
- `game_state`: sync state `{ type, state: { state, game } }`
- `settings`: settings broadcast `{ type, backToWhite, duration }`

## Where to look

- Navigation setup: `App.tsx`
- Tools list and metadata: `constants.ts`
- Colors game: `screens/ColorsScreen.tsx`
- Chain Calculator game: `screens/ChainCalculatorScreen.tsx`
- Lobby UI + flow: `screens/LobbyScreen.tsx`
- P2P stack: `hooks/useNearbyLobby.ts`
- Audio + mic: `hooks/useAudio.ts`, `hooks/useMicrophone.ts`
- Local storage: `hooks/useLocalStorage.ts`
- Shared types: `types.ts`, `types/navigation.ts`

Additional notes exist in screen-level docs:
- `screens/CLAUDE.md`
- `screens/colors/CLAUDE.md`
- `screens/chain-calculator/CLAUDE.md`
- `screens/lobby/CLAUDE.md`

## Commands (from package.json)

- Install: `npm install`
- Dev server: `npm start`
- Android (named devices): `npm run android:pixel`, `npm run android:pad`, `npm run android:oppo`
- Android (all devices): `npm run android:all`
- Web (Expo): `npm run web`
- Android release build: `npm run build:android`

## Conventions and constraints

- TypeScript is used everywhere; prefer type-safe changes.
- Hooks own business logic; screens orchestrate UI with hooks and components.
- No test framework is set up; changes should be validated manually.
- Keep changes localized; avoid editing `node_modules/`.

## Common pitfalls

- Nearby Connections permissions are required on Android; verify `app.json` if adding
  new P2P features.
- AsyncStorage is not encrypted; avoid storing sensitive data.
- P2P messages are unvalidated; any new message types should be validated in
  `useNearbyLobby.ts` and typed in `types.ts`.

## Safe change map

- UI tweaks: `components/`, `screens/`
- Game logic: relevant screen + related hooks
- Protocol changes: `hooks/useNearbyLobby.ts` + `types.ts` + screen handler

## If you are unsure

Start with `App.tsx` and the relevant screen, then follow imports to hooks and
components. Keep edits small and re-check the flows above.
