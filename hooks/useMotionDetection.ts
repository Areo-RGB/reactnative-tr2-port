/**
 * useMotionDetection.ts
 *
 * Platform-specific module re-export for TypeScript compatibility
 *
 * Metro bundler automatically resolves platform-specific files:
 * - useMotionDetection.native.ts for Android (full implementation)
 * - useMotionDetection.web.ts for Web (stub that returns isAvailable: false)
 *
 * This file provides TypeScript type resolution during compilation.
 * At runtime, Metro replaces it with the correct platform version.
 */

// Re-export from native implementation for type information
// Metro will replace this with the correct platform version at runtime
export * from './useMotionDetection.native';
