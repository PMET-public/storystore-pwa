import request from 'request'
import sharp from 'sharp'
import { URL } from 'url'
import cache from 'memory-cache'
import { NextApiRequest, NextApiResponse } from 'next'

const DAY_IN_SECONDS = 86400
const { MAGENTO_URL = '' } = process.env

const safeSize = (size: number | null = null, maxSize = 2000): number | null => {
    return size && size > maxSize ? maxSize : size
}

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const url = new URL(req.query.url.toString(), MAGENTO_URL)
    const format = req.query.format?.toString() || 'jpeg'

    const renewCache = req.query.renewCache === 'yes'
    const width = req.query.width ? Number(req.query.width) : null
    const height = req.query.height ? Number(req.query.height) : null
    const fit = (req.query.fit as '') || undefined

    res.setHeader('Content-Type', `image/${format}`)
    const body =
        (!renewCache && cache.get(url.href)) ||
        (await new Promise((success, reject) => {
            request.get({ url: url.href, encoding: null }, (error, response) => {
                if (error) {
                    res.statusCode = 500
                    res.send(null)
                    return reject()
                }

                const { statusCode, body } = response

                if (statusCode >= 400) {
                    res.statusCode = statusCode
                    res.send(null)
                    return reject()
                }

                cache.put(url.href, body, DAY_IN_SECONDS * 7)

                success(body)
            })
        }))

    const image = sharp(body)

    if (width) {
        image.resize(safeSize(width, 2000), safeSize(height, 2000), {
            fit,
            withoutEnlargement: true,
        })
    }

    image
        .toFormat(format)
        .toBuffer()
        .then(responseBody => {
            res.setHeader('Cache-Control', 'max-age=2592000, immutable')
            res.send(responseBody)
        })
        .catch(() => {
            res.statusCode = 500
            res.send(null)
        })
}

export default ImagesApi
