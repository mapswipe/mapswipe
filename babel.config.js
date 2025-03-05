module.exports = (api) => {
    const isTest = api.env('test');
    if (isTest) {
        return {
            presets: [
                ['module:@react-native/babel-preset'],
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current',
                        },
                    },
                ],
            ],
            plugins: ['@babel/plugin-transform-named-capturing-groups-regex'],
        };
    }
    return {
        presets: ['module:@react-native/babel-preset'],
        plugins: ['@babel/plugin-transform-named-capturing-groups-regex'],
        env: {
            production: {
                plugins: ['transform-remove-console'],
            },
        },
    };
};
