require('dotenv').config()

import express from 'express'
import request from 'request'
import next from 'next'

const {
    NODE_ENV = 'development',
    PORT = 3000,
    MAGENTO_GRAPHQL_URL = ``,
    LAUNCH_IN_BROWSER = false,
} = process.env

const dev = NODE_ENV !== 'production'

const app = next({ dev })

const handle = app.getRequestHandler()

const url = `http://localhost:${PORT}`

app.prepare().then(() => {
    const server = express()

    /**
     * GraphQL Proxy
     */
    server.post('/graphql', (req, res) => {
        req.pipe(request(MAGENTO_GRAPHQL_URL)).pipe(res)
    })

    /**
     * Static Files
     */
    server.get('/_next/*', (req, res) => {
        return handle(req, res)
    })

    /**
     * Magento Routes
     */
    server.get('*', (req, res) => {
        return app.render(req, res, '/_url-resolver', { url: req.url })
    })

    server.listen(PORT, () => {
        console.info('Server started...')

        // Launch in browser
        if (LAUNCH_IN_BROWSER) {
            const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open')
            console.info(`Launching ${url}...`)
            require('child_process').exec(start + ' ' + url)
        }
    })
})
