import request, { RequestCallback } from 'request'
import sharp from 'sharp'
import { URL } from 'url'
import cacheableResponse from 'cacheable-response'

const { MAGENTO_URL = '' } = process.env

const ssrImage = async (req: any, res: any) => {
    const width = req.query.width ? Number(req.query.width) : 2000
    const height = req.query.height ? Number(req.query.height) : null

    const url = new URL(req.query.url, MAGENTO_URL)
    const format = req.query.format || 'jpeg'
    const fit = req.query.fit || 'cover'
    const quality = req.query.quality ? Number(req.query.quality) : 100

    return new Promise((resolve, reject) => {
        try {
            request.get({ url: url.href, encoding: null }, async (error, response) => {
                if (error) {
                    res.statusCode = 500
                    throw Error()
                }

                const { statusCode, body } = response

                if (statusCode >= 400) {
                    res.statusCode = statusCode
                    throw Error()
                }

                const image = await sharp(body)
                    .resize(width > 2000 ? 2000 : width, height && height > 2000 ? 2000 : height, {
                        fit,
                    })
                    .toFormat(format, { quality })
                    .toBuffer()

                resolve({ format, image })
            })
        } catch (error) {
            reject(error)
        }
    })
}

const imageCache = cacheableResponse({
    ttl: 86400, // 7 days
    get: async ({ req, res }: any) => ({
        data: await ssrImage(req, res),
    }),
    send: ({ data, res }: any) => {
        const { format, image } = data
        res.setHeader('Cache-Control', 'max-age=604800, immutable')
        res.setHeader('Content-Type', `image/${format}`)
        res.send(image)
    },
})

export const ImagesApi: RequestCallback = (req, res) => imageCache({ req, res })

export default ImagesApi
