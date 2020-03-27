import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
    api: {
        bodyParser: false,
    },
}

export const CheckEndpointApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const url = req.query.url?.toString()

    if (!url) {
        res.status(422)
        return res.send({ success: false })
    }

    const graphQLQuery = encodeURI('query{categoryList{id}}')

    const MAGENTO_URL = new URL(`graphql?query=${graphQLQuery}`, url).href

    request(MAGENTO_URL, (error, data) => {
        if (error?.code === 'ENOTFOUND') {
            res.status(404)
            return res.send({ success: false })
        }

        if (error) {
            console.error(error)
            res.status(500)
            return res.send({ success: false })
        }

        try {
            const body = JSON.parse(data.toJSON().body)
            return res.send({ success: !!body.data?.categoryList?.shift().id })
        } catch (_error) {
            return res.send({ success: false })
        }
    })
}

export default CheckEndpointApi
