require('dotenv').config()

const { join } = require('path')
const express = require('express')
const request = require('request')
const next = require('next')
const compression = require('compression')
const sharp = require('express-sharp')

const { NODE_ENV = 'development', PORT = 3000, MAGENTO_CLOUD_URL = '', LAUNCH_IN_BROWSER = false } = process.env

const MAGENTO_GRAPHQL_URL = new URL('graphql', MAGENTO_CLOUD_URL).href

const dev = NODE_ENV !== 'production'

const app = next({ dev })

const handle = app.getRequestHandler()


app.prepare().then(async () => {
    const server = express()

    /**
     * Compression
     */
    server.use(compression())

    /**
     * Images
     */
    server.use(
        '/images',
        sharp({
            baseHost: new URL(MAGENTO_CLOUD_URL).href,
        })
    )

    /**
     * GraphQL Proxy
     */
    server.get('/graphql', (req, res) => {
        req.pipe(
            request
                .get({
                    qs: req.query,
                    url: MAGENTO_GRAPHQL_URL,
                    separateReqPool: { maxSockets: 20 },
                })
                .on('error', error => {
                    console.error(error)
                })
        ).pipe(res)
    })

    server.post('/graphql', (req, res) => {
        req.pipe(request.post(MAGENTO_GRAPHQL_URL))
            .on('error', error => {
                console.error(error)
            })
            .pipe(res)
    })

    /**
     * Static Files
     */
    server.get('/_next/*', (req, res) => {
        return handle(req, res)
    })

    server.use('/static', express.static('public/static'))

    /**
     * 🤖
     */
    server.get('/robots.txt', (req, res) => {
        const filePath = join(__dirname, 'public', 'robot.txt')
        app.serveStatic(req, res, filePath)
    })

    /**
     * Web Manifest
     */
    server.get('/manifest.webmanifest', (req, res) => {
        const filePath = join(__dirname, '.next', 'manifest.webmanifest')
        app.serveStatic(req, res, filePath)
    })

    /**
     * Service Worker
     */
    server.get('/service-worker.js', (req, res) => {
        const filePath = join(__dirname, '.next', 'service-worker.js')
        app.serveStatic(req, res, filePath)
    })

    /**
     * Home Page
     */
    server.get('/', (req, res) => {
        return app.render(req, res, '/index', req.query)
    })

    /**
     * Cart Page
     */
    server.get('/cart', (req, res) => {
        return app.render(req, res, '/cart', req.query)
    })

    /**
     * Cart Page
     */
    server.get('/checkout', (req, res) => {
        return app.render(req, res, '/checkout', req.query)
    })

    /**
     * Search Page
     */
    server.get('/search', (req, res) => {
        return app.render(req, res, '/search', req.query)
    })

    /**
     * Magento URL Resolver Routes
     */
    server.get('*', (req, res) => {
        return app.render(req, res, '/_url-resolver', { url: req.url })
    })

    server.listen(PORT, () => {
        console.info(`Server started on port ${PORT}...`)
        // Launch in browser
        if (LAUNCH_IN_BROWSER) {
            const url = `http://localhost:${PORT}`
            const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
            console.info(`Launching ${url}...`)
            require('child_process').exec(start + ' ' + url)
        }
    })
})
