import { COOKIE } from '~/lib/cookies'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import https, { RequestOptions } from 'https'
import http from 'http'
import sharp from 'sharp'

export const config = {
    api: {
        bodyParser: false,
    },
}

const images = (request: NextApiRequest, response: NextApiResponse) => {
    const imageURL = request.query.url.toString()

    let settings = {
        magentoUrl: process.env.MAGENTO_URL,
    }

    if (Boolean(process.env.CLOUD_MODE)) {
        settings = {
            ...settings,
            ...JSON.parse(request.cookies[COOKIE.settings] || '{}'),
        }
    }

    const query = request.url?.split('?')[1]

    const magentoUrl = new URL(imageURL + (query ? `?${query}` : ''), settings.magentoUrl)

    const options: RequestOptions = {
        headers: {
            ...request.headers,
            host: magentoUrl.host,
        },
    }

    const httpx = magentoUrl.protocol === 'https:' ? https : http

    const proxy = httpx.request(magentoUrl, options, res => {
        /** Image Optimization */

        const _width = Number(magentoUrl.searchParams.get('w')) || undefined
        const width = _width && (_width > 3000 ? 3000 : _width)

        const _height = Number(magentoUrl.searchParams.get('h')) || undefined
        const height = _height && (_height > 3000 ? 3000 : _height)

        const webp = magentoUrl.searchParams.get('webp') || false

        // Resize Image
        const resizer = sharp().resize(width, height)

        // Deliver as webP
        if (webp) resizer.webp()

        response.status(res.statusCode ?? 500)
        response.setHeader('cache-control', res.headers['cache-control'] ?? 'no-cache')
        response.setHeader('content-type', webp ? 'image/webp' : (res.headers['content-type'] as string))

        res.pipe(resizer).pipe(response)
    })

    return new Promise(resolve => {
        request.pipe(proxy).on('response', resolve)
    })
}

export default images
