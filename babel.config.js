module.exports = (api) => {
    const isTest = api.env('test');
    if (isTest) {
        return {
            presets: [
                ['module:metro-react-native-babel-preset'],
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current',
                        },
                    },
                ],
            ],
        };
    }
    return {
        presets: ['module:metro-react-native-babel-preset'],
        env: {
            production: {
                plugins: ['transform-remove-console'],
            },
        },
    };
};
