require('dotenv').config()

const express = require('express')
const request = require('request')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const graphQlUrl = new URL('graphql', process.env.MAGENTO_BACKEND_URL).href
const port = process.env.PORT = process.env.PORT || 3000


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
        console.log(`> Ready on http://localhost:${port}`)
    })
})