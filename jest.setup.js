require('@testing-library/jest-native/extend-expect');

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('lucide-react-native', () => {
    const React = require('react');
    return new Proxy(
        {},
        {
            get: () => (props) => React.createElement('Icon', props),
        }
    );
});

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        SafeAreaView: ({ children }) => React.createElement(View, null, children),
        SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
        useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    };
});
