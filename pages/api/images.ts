import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

const maxAge = 30 * 86400 // 30 days 31536000

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const url = req.query.url.toString()

        req.pipe(
            request.get({
                qs: req.query,
                url: new URL(url, process.env.MAGENTO_URL).href,
                pool: {
                    maxSockets: Infinity,
                },
            })
        )
            .once('response', response => {
                response.headers['Cache-Control'] = `max-age=${maxAge}, immutable`
            })
            .pipe(res)
    } catch (error) {
        console.error(error)
        res.status(500).end()
    }
}

export default ImagesApi
