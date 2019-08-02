require('dotenv').config()

import express from 'express'
import request from 'request'
import next from 'next'
import { uri as graphQLUri } from './lib/apollo-client'

const dev = process.env.NODE_ENV !== 'production'

const app = next({ dev })

const handle = app.getRequestHandler()

const port = process.env.PORT || 3000

const url = `http://localhost:${port}`

app.prepare().then(() => {
    const server = express()

    /**
     * GraphQL Proxy
     */
    server.post('/graphql', (req, res) => {
        req.pipe(request(graphQLUri)).pipe(res)
    })

    /**
     * Static Files
     */
    server.get('_next/*', (req, res) => {
        return handle(req, res)
    })

    /**
     * Magento Routes
     */
    server.get('*', (req, res) => {
        return app.render(req, res, '/_url-resolver', { url: req.url })
    })

    server.listen(port, () => {
        console.info('Server started...')

        // Launch in browser
        if (process.env.LAUNCH_IN_BROWSER) {
            const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open')
            console.info(`Launching ${url}...`)
            require('child_process').exec(start + ' ' + url)
        }
    })
})
