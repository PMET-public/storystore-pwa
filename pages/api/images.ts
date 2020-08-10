import { COOKIE } from '~/lib/cookies'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { runApiMiddleware } from '~/lib/runApiMiddleware'

export const config = {
    api: {
        bodyParser: false,
    },
}

const proxyImages = async (req: NextApiRequest, res: NextApiResponse) => {
    const imageURL = req.query.url.toString()

    let settings = {
        magentoUrl: process.env.MAGENTO_URL,
    }

    let auth

    /**
     * Override Settings (StoryStore)
     */
    if (Boolean(process.env.CLOUD_MODE)) {
        settings = {
            ...settings,
            ...JSON.parse(req.cookies[COOKIE.settings] || '{}'),
        }
    }

    const query = req.url?.split('?')[1]

    const url = new URL(imageURL + (query ? `?${query}` : ''), settings.magentoUrl)

    if (!url.href) {
        res.statusCode = 422
        res.send(null)
    }

    if (url.username && url.password) {
        auth = `${url.username}:${url.password}`
    }

    await runApiMiddleware(req, res, createProxyMiddleware({ target: url.href, changeOrigin: true, auth, logLevel: 'error' }))
}

export default proxyImages
