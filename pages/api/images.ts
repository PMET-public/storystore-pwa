import request from 'request'
import sharp from 'sharp'
import { URL } from 'url'
import cache from 'memory-cache'
import { NextApiRequest, NextApiResponse } from 'next'

const MAX_AGE = 30 * 86400 // 30 daus
const MAX_PX = 2560
const { MAGENTO_URL = '' } = process.env

/**
 * Returns a size not larger than MAX_PX
 */
const safeSize = (size: number | null = null): number | null => {
    return size && size > MAX_PX ? MAX_PX : size
}

/**
 * Fetch image from Magento
 */
const fetchImage = async (_url: string) => {
    const url = new URL(_url, MAGENTO_URL).href

    return new Promise((resolve, reject) => {
        request.get({ url, encoding: null }, (error, response) => {
            if (error) {
                return reject({ statusCode: 500, body: null })
            }

            const { statusCode, body } = response

            if (statusCode >= 400) {
                return reject({ statusCode, body: null })
            }

            cache.put(_url, body, MAX_AGE)

            resolve(body)
        })
    })
}

export const ImagesApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const url = req.query.url.toString()
    const format = req.query.format?.toString() || 'jpeg'
    const width = req.query.width ? Number(req.query.width) : null
    const height = req.query.height ? Number(req.query.height) : null
    const fit = (req.query.fit as '') || undefined

    res.setHeader('Content-Type', `image/${format}`)

    try {
        const body = cache.get(url) || (await fetchImage(url))

        const image = sharp(body)

        if (width) {
            image.resize(safeSize(width), safeSize(height), {
                fit,
                withoutEnlargement: true,
            })
        }

        image
            .toFormat(format)
            .toBuffer()
            .then(responseBody => {
                res.setHeader('Cache-Control', `max-age=${MAX_AGE}, immutable`)
                res.send(responseBody)
            })
    } catch ({ statusCode = 500, body = null }) {
        res.statusCode = statusCode
        res.send(body)
    }
}

export default ImagesApi
