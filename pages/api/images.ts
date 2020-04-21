import { COOKIE } from '~/lib/cookies'
import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

const maxAge = 30 * 86400 // 30 days 31536000

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const imageURL = req.query.url.toString()

    const settings = {
        magentoUrl: process.env.MAGENTO_URL,
        ...JSON.parse(req.cookies[COOKIE.settings] || '{}'),
    }

    const magentoUrl = new URL(imageURL, settings.magentoUrl).href

    req.pipe(
        request.get(
            {
                qs: req.query,
                url: magentoUrl,
                pool: {
                    maxSockets: Infinity,
                },
            },
            (error, response) => {
                if (error) {
                    console.error(error)
                    res.status(500).end()
                    return
                }
                if (response) {
                    response.headers['Cache-Control'] = `max-age=${maxAge}, immutable`
                }
            }
        )
    ).pipe(res)
}

export default ImagesApi
