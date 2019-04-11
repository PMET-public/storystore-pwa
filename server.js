require('dotenv').config()

const express = require('express')
const request = require('request')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const graphQlUrl = new URL('graphql', process.env.MAGENTO_BACKEND_URL).href
const port = process.env.PORT || 3000
const url = `http://localhost:${port}`

app.prepare().then(() => {
    const server = express()

    /**
     * GraphQL Proxy
     */
    server.post('/graphql', (req, res) => {
        req.pipe(request(graphQlUrl)).pipe(res)
    })

    server.get('/', (req, res) => {
        return app.render(req, res, '/', req.query)
    })

    server.get('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, err => {
        if (err) throw err
        console.log('Server started...')

        // Launch in browser
        if (process.env.LAUNCH_IN_BROWSER) {
            const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
            console.log(`Launching ${url}...`)
            require('child_process').exec(start + ' ' + url);
        }
    })
})