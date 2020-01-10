import request from 'request'
import sharp from 'sharp'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

const { MAGENTO_URL = '' } = process.env

export const ImagesApi = (req: NextApiRequest, res: NextApiResponse) => {
    const url = new URL(req.query.url.toString(), MAGENTO_URL)
    const format = req.query.format?.toString() || 'jpeg'

    const width = req.query.width && Number(req.query.width)
    const height = req.query.height && Number(req.query.height)

    res.setHeader('Content-Type', `image/${format}`)

    request.get({ url: url.href, encoding: null }, (error, response) => {
        if (error) {
            res.statusCode = 500
            res.send(response)
        }

        const { statusCode, body } = response

        if (statusCode >= 400) {
            res.statusCode = statusCode
            res.send(null)
        }

        const image = sharp(body)

        if (width) {
            image.resize(width > 2000 ? 2000 : width, height ? (height > 2000 ? 2000 : height) : undefined)
        }

        image
            .toFormat(format)
            .toBuffer()
            .then(responseBody => {
                res.setHeader('Cache-Control', 'max-age=2592000, immutable')
                res.send(responseBody)
            })
            .catch(error => {
                res.statusCode = 500
                res.send(error)
            })
    })
}

export default ImagesApi
