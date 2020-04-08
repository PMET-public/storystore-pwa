import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import { SETTINGS_OVERRIDE_COOKIE } from '../../lib/overrideFromCookie'

const maxAge = 30 * 86400 // 30 days 31536000

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const imageURL = req.query.url.toString()

    const settings = {
        MAGENTO_URL: process.env.MAGENTO_URL,
        ...JSON.parse(req.cookies[SETTINGS_OVERRIDE_COOKIE] || '{}'),
    }

    const MAGENTO_URL = new URL(imageURL, settings.MAGENTO_URL).href

    req.pipe(
        request.get(
            {
                qs: req.query,
                url: MAGENTO_URL,
                rejectUnauthorized: false,
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
