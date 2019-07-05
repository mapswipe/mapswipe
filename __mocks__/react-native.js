import * as RN from 'react-native';

// overwrite Animated with a mock that does nothing
// to prevent varying opacity during tests
RN.Animated.timing = () => ({
    reset: () => jest.fn(),
    start: () => jest.fn(),
});

module.exports = RN;
