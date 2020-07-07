import { COOKIE } from '~/lib/cookies'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import https, { RequestOptions } from 'https'
import http from 'http'

const proxyImages = async (request: NextApiRequest, response: NextApiResponse) =>
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

        const proxy = httpx
            .request(magentoUrl, options, res => {
                // Set Cache Headers – for Now.sh Edge
                if (Boolean(!process.env.CLOUD_MODE)) {
                    res.headers['Cache-Control'] = 's-maxage=1, stale-while-revalidate'
                }

                response.writeHead(res.statusCode as number, res.headers)

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
