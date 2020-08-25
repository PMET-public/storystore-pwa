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

const images = async (request: NextApiRequest, response: NextApiResponse) =>
    new Promise(resolve => {
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

        const proxy = httpx.request(magentoUrl, options, async res => {
            if ((res.statusCode || 0) >= 400 || !res.headers['content-type']) {
                return res.pipe(response)
            }

            /** Vercel Edge Cache */
            response.setHeader('cache-control', 's-maxage=1, stale-while-revalidate')

            if (process.env.PROCESS_IMAGES === 'true') {
                const _width = Number(magentoUrl.searchParams.get('w')) || undefined
                const width = _width && (_width > 3000 ? 3000 : _width)

                const _height = Number(magentoUrl.searchParams.get('h')) || undefined
                const height = _height && (_height > 3000 ? 3000 : _height)

                const transform = sharp()

                /** Resize */
                if (width) transform.resize({ width, height, withoutEnlargement: true })

                /** WebP */
                if (magentoUrl.searchParams.get('type') === 'webp') {
                    transform.webp()
                    response.setHeader('content-type', 'image/webp')
                }

                const buffer = await res.pipe(transform).toBuffer()

                response.send(buffer)
            }

            return res.pipe(response)
        })

        request.on('end', resolve)

        proxy.end()
    })

export default images
