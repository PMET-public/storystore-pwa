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

const proxyGraphQl = async (req: NextApiRequest, res: NextApiResponse) => {
    let settings = {
        magentoUrl: process.env.MAGENTO_URL,
    }

    if (Boolean(process.env.CLOUD_MODE)) {
        settings = {
            ...settings,
            ...JSON.parse(req.cookies[COOKIE.settings] || '{}'),
        }
    }

    const query = req.url?.split('?')[1]

    const url = new URL('graphql' + (query ? `?${query}` : ''), settings.magentoUrl)

    await runApiMiddleware(req, res, createProxyMiddleware({ target: url.href, changeOrigin: true, logLevel: 'error' }))
}

export default proxyGraphQl
