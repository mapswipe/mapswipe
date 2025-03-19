module.exports = {
    root: true,
    parser: 'hermes-eslint',
    plugins: ['ft-flow', 'react', 'react-native', 'import', 'jest', 'jsx-a11y'],
    extends: [
        'airbnb',
        'plugin:prettier/recommended',
        'eslint:recommended',
        'plugin:ft-flow/recommended',
    ],
    rules: {
        'ft-flow/no-missing-types': 'off', // Disable missing Flow type errors
        'ft-flow/use-exact-by-default': 'off', // Ignore exact object type enforcement
        'ft-flow/require-valid-file-annotation': 'off',
        'class-methods-use-this': 'off',
        'no-console': 'off',
        indent: 'off',
        'spaced-comment': 'off',
        'react/jsx-curly-newline': 'off',
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        'react/jsx-one-expression-per-line': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/jsx-wrap-multilines': 'off',
        'react/prefer-stateless-function': [2, { ignorePureComponents: true }],
        'react/require-default-props': 'off',
        'react/default-props-match-prop-types': 'off',
        'react/static-property-placement': 'off',
        'react/forbid-prop-types': [0, { forbid: [] }],
        'react-native/no-unused-styles': 2,
        'import/extensions': [1, 'never', { svg: 'always' }],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
                optionalDependencies: false,
                peerDependencies: false,
            },
        ],
    },
    globals: {
        Generator: true,
        IntervalID: true,
        $Keys: true,
    },
    settings: {
        'ft-flow': {
            onlyFilesWithFlowAnnotation: false,
        },
    },
    env: {
        jest: true,
        'jest/globals': true,
        'react-native/react-native': true,
    },
};
