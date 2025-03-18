module.exports = api => {
    const isTest = api.env('test');
    if (isTest) {
        return {
            presets: [
                ['module:@react-native/babel-preset', '@babel/preset-flow'],
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current',
                        },
                    },
                ],
            ],
            plugins: [
                '@babel/plugin-transform-named-capturing-groups-regex',
                'babel-plugin-syntax-hermes-parser',
            ],
        };
    }
    return {
        presets: ['module:@react-native/babel-preset', '@babel/preset-flow'],
        plugins: [
            '@babel/plugin-transform-named-capturing-groups-regex',
            'babel-plugin-syntax-hermes-parser',
        ],
        env: {
            production: {
                plugins: ['transform-remove-console'],
            },
        },
    };
};
