import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

const url = new URL('graphql', process.env.MAGENTO_URL).href

export const config = {
    api: {
        bodyParser: false,
    },
}

export const GraphQLApi = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            req.pipe(request.post(url)).pipe(res)
        } else {
            req.pipe(
                request.get({
                    qs: req.query,
                    url,
                    pool: {
                        maxSockets: Infinity,
                    },
                })
            ).pipe(res)
        }
    } catch (error) {
        console.error(error)
        res.status(500).end()
    }
}

export default GraphQLApi
