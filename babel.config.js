module.exports = {
    presets: ['next/babel'],
    plugins: [
        'inline-react-svg',
        [
            'babel-plugin-styled-components',
            {
                ssr: true,
                displayName: true,
                preprocess: false,
            },
        ],
    ],
}
