module.exports = ({ config }) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        options: {
            presets: [ require.resolve('babel-preset-react-app') ],
            plugins: [ require.resolve('babel-plugin-typescript-to-proptypes') ],
        },
    })

    config.resolve.extensions.push('.ts', '.tsx')

    config.resolve.alias = {
        ...config.resolve.alias,
        ...require('../next.config').aliases
    }

    return config
}