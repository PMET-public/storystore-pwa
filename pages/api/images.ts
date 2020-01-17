import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

const MAX_AGE = 30 * 86400 // 30 days
const { MAGENTO_URL = '' } = process.browser ? (window as any) : process.env

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
        const url = req.query.url.toString()

        req.pipe(
            request.get({
                qs: req.query,
                url: new URL(url, MAGENTO_URL || '').href,
                pool: {
                    maxSockets: Infinity,
                },
            })
        )
            .on('response', res => {
                /** Use Edge Case in now.sh */
                res.headers['Cache-Control'] = `max-age=${MAX_AGE}, immutable`
            })
            .pipe(res)
            .on('error', reject)
            .on('response', resolve)
    })
}

export default ImagesApi
