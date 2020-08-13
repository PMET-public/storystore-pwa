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
        response.status(res.statusCode ?? 500)
        response.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')
        response.setHeader('content-type', res.headers['content-type'] as string)
        response.setHeader('date', res.headers['date'] as string)
        response.setHeader('expires', res.headers['expires'] as string)
        response.setHeader('last-modified', res.headers['last-modified'] as string)
        response.setHeader('strict-transport-security', res.headers['last-modified'] as string)

        if (Boolean(process.env.PROCESS_IMAGES)) {
            /** Process Images */

            const _width = Number(magentoUrl.searchParams.get('w')) || undefined
            const width = _width && (_width > 3000 ? 3000 : _width)

            const _height = Number(magentoUrl.searchParams.get('h')) || undefined
            const height = _height && (_height > 3000 ? 3000 : _height)

            const webp = /image\/webp/.test(request.headers.accept ?? '')

            // Resize Image
            const resizer = sharp().resize(width, height)

            // Deliver as webP
            if (webp) {
                resizer.webp()
                response.setHeader('content-type', 'image/webp')
            }

            res.pipe(resizer).pipe(response)

            return
        }

        res.pipe(response)
    })

    return new Promise(resolve => {
        request.pipe(proxy).on('response', resolve)
    })
}

export default images
