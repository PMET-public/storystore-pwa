const sharp = require('sharp')
const request = require('request')

const { MAGENTO_URL } = process.env

module.exports = async (req) => {
    const width = req.params.width ? Number(req.params.width) : 2000
    const height = req.params.height ? Number(req.params.height) : null

    const url = new URL(req.query.url, MAGENTO_URL)
    const format = req.query.format || 'jpeg'
    const fit = req.query.fit || 'cover'
    const quality = req.query.quality ? Number(req.query.quality) : 100

    return new Promise((resolve, reject) => {

        try {
            request.get({ url: url.href, encoding: null }, async (error, response) => {
                if (error) {
                    throw Error(500)
                }

                const { statusCode, body } = response

                if (statusCode >= 400) {
                    throw Error(statusCode)
                }

                const image = await sharp(body)
                    .resize(
                        width > 2000 ? 2000 : width,
                        height > 2000 ? 2000 : height,
                        { fit, isProgressive: true }
                    )
                    .toFormat(format, { quality })
                    .toBuffer()

                resolve({ format, image })
            })


        } catch (error) {
            reject(error)
        }
    })

}