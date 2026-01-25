module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    clearMocks: true,
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|expo(nent)?|expo-modules-core|@expo(nent)?/.*|@unimodules/.*|unimodules|@sentry/react-native|react-native-reanimated)/)'
    ],
};
