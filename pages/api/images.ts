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

        if ((res.statusCode || 0) >= 400 || !res.headers['content-type']) {
            return res.pipe(response)
        }

        response.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')
        if (res.headers['date']) response.setHeader('date', res.headers['date'])
        if (res.headers['expires']) response.setHeader('expires', res.headers['expires'])
        if (res.headers['last-modified']) response.setHeader('last-modified', res.headers['last-modified'])
        if (res.headers['last-modified']) response.setHeader('strict-transport-security', res.headers['last-modified'])

        if (Boolean(process.env.PROCESS_IMAGES)) {
            /** Process Images */

            const _width = Number(magentoUrl.searchParams.get('w')) || undefined
            const width = _width && (_width > 3000 ? 3000 : _width)

            const _height = Number(magentoUrl.searchParams.get('h')) || undefined
            const height = _height && (_height > 3000 ? 3000 : _height)

            // Resize Image
            const resizer = sharp()

            if (width) resizer.resize({ width, height, withoutEnlargement: true })

            // Deliver as webP
            if (magentoUrl.searchParams.get('type') === 'webp') {
                resizer.webp()
                response.setHeader('content-type', 'image/webp')
            } else {
                const format = res.headers['content-type'].split('/')?.pop() ?? 'jpeg'
                resizer.toFormat(format)
                response.setHeader('content-type', `image/${format}`)
            }

            return res.pipe(resizer).pipe(response)
        }

        res.pipe(response)
    })

    return new Promise(resolve => {
        request.pipe(proxy).on('response', resolve)
    })
}

export default images
