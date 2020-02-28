import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import sharp from 'sharp'

const maxAge = 30 * 86400 // 30 days

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const url = req.query.url.toString()

        const transformer = sharp()

        if (req.query.webp) transformer.webp()

        /** Use Edge Case in now.sh */
        res.setHeader('Cache-Control', `max-age=${maxAge}, immutable`)

        request
            .get({
                qs: req.query,
                url: new URL(url, process.env.MAGENTO_URL).href,
                pool: {
                    maxSockets: Infinity,
                },
            })
            .pipe(transformer)
            .pipe(res)
    } catch (error) {
        console.error(error)
        res.status(500).end()
    }
}

export default ImagesApi
