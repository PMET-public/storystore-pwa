import { COOKIE } from '~/lib/cookies'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import https, { RequestOptions } from 'https'
import http from 'http'

const maxAge = 30 * 86400 // 30 days 31536000

const proxyImages = async (request: NextApiRequest, response: NextApiResponse) =>
    new Promise(resolve => {
        const imageURL = request.query.url.toString()

        const settings = {
            magentoUrl: process.env.MAGENTO_URL,
            ...JSON.parse(request.cookies[COOKIE.settings] || '{}'),
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

        const proxy = httpx
            .request(magentoUrl, options, res => {
                // Set Cache Headers – for Now.sh Edge
                response.writeHead(res.statusCode as number, res.headers)
                response.setHeader('Cache-Control', `max-age=${maxAge}, immutable`)

                res.pipe(response, {
                    end: true,
                })
            })
            .on('error', error => {
                if (error) {
                    // @ts-ignore
                    if (error.code === 'ENOTFOUND') {
                        response.status(404)
                    } else {
                        response.status(500)
                        console.error(error.message)
                    }

                    response.end()
                }
            })

        request
            .pipe(proxy, {
                end: true,
            })
            .on('response', resolve)
    })

export default proxyImages
