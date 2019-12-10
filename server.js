require('dotenv').config()

const express = require('express')
const request = require('request')
const next = require('next')
const compression = require('compression')
const sharp = require('sharp')
const cacheableResponse = require('cacheable-response')
const { join } = require('path')

const { NODE_ENV = 'development', PORT = 3000, MAGENTO_URL = '', LAUNCH_IN_BROWSER = false } = process.env

const MAGENTO_GRAPHQL_URL = new URL('graphql', MAGENTO_URL).href

const dev = NODE_ENV !== 'production'

const app = next({ dev })

const handle = app.getRequestHandler()

const ssrCache = cacheableResponse({
    ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
    get: async ({ req, res, pagePath, queryParams }) => ({
        data: await app.renderToHTML(req, res, pagePath, queryParams),
    }),
    send: ({ data, res }) => res.send(data),
})

const ssrImageResolver = async (req) => {
    const width = req.params.width ? Number(req.params.width) : 2000
    const height = req.params.height ? Number(req.params.height) : null

    const url = new URL(req.query.url, MAGENTO_URL)
    const format = req.query.format || 'jpeg'
    const fit = req.query.fit || 'cover'
    const quality = req.query.quality ? Number(req.query.quality) : 100

    // res.set('Content-Type', `image/${format}`)

    return new Promise((resolve, reject) => {

        try {
            request.get({ url: url.href, encoding: null }, async (error, response) => {
                const { statusCode, body } = response

                if (statusCode >= 400) {
                    throw Error(statusCode)
                }

                const image = await sharp(body)
                    .resize(
                        width > 2000 ? 2000 : width,
                        height > 2000 ? 2000 : height,
                        { fit, isProgressive: true }
                    )
                    .toFormat(format, { quality })
                    .toBuffer()

                resolve({ format, image })
            })


        } catch (error) {
            reject(error)
        }
    })

}

const imageCache = cacheableResponse({
    ttl: 1000 * 60 * 60 * 24 * 30, // 30 days
    get: async ({ req, res }) => ({
        data: await ssrImageResolver(req),
    }),
    send: ({ data, res }) => {
        const { format, image } = data
        res.set('Content-Type', `image/${format}`)
        res.send(image)
    },
})

app.prepare().then(async () => {
    const server = express()

    server.disable('x-powered-by')

    server.use((req, res, next) => {
        res.setHeader('X-Powered-By', 'Luma PWA')
        next()
    })

    /**
     * Compression
     */
    server.use(compression())

    /**
     * Images
     */
    server.get('/images/resize/:width/:height?', (req, res) => imageCache({ req, res }))

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
    server.get('/_next/*', handle)

    server.use('/static', express.static('./public/static'))
    /**
     * 🤖
     */
    server.get('/robots.txt', (req, res) => {
        const filePath = join(__dirname, './public', 'robots.txt')
        app.serveStatic(req, res, filePath)
    })

    /**
     * Web Manifest
     */
    server.get('/manifest.webmanifest', (req, res) => {
        const filePath = join(__dirname, './public', 'manifest.webmanifest')
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
        const queryParams = req.query
        return ssrCache({ req, res, pagePath: '/', queryParams })
    })

    /**
     * Cart Page
     */
    server.get('/cart', (req, res) => {
        const queryParams = req.query
        return ssrCache({ req, res, pagePath: '/cart', queryParams })
    })

    /**
     * Cart Page
     */
    server.get('/checkout', (req, res) => {
        const queryParams = req.query
        return ssrCache({ req, res, pagePath: '/checkout', queryParams })
    })

    /**
     * Search Page
     */
    server.get('/search', (req, res) => {
        const queryParams = req.query
        return ssrCache({ req, res, pagePath: '/search', queryParams })
    })

    /**
     * Magento URL Resolver Routes
     */
    server.get('*', (req, res) => {
        const queryParams = req.query
        return ssrCache({ req, res, pagePath: '/_url-resolver', queryParams: { url: req.url, ...queryParams } })
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
