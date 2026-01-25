/**
 * useNearbyLobby.ts
 *
 * Platform-specific module re-export for TypeScript compatibility
 *
 * Metro bundler automatically resolves platform-specific files
 * (.native.ts for Android/iOS, .web.ts for web), but TypeScript
 * needs this file for type resolution during compilation.
 *
 * At runtime, this file is never loaded - Metro replaces it with
 * the platform-specific version.
 */

// Re-export from native implementation for type information
// Metro will replace this with the correct platform version at runtime
export * from './useNearbyLobby.native';
