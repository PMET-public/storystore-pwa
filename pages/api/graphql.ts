import { NextApiRequest, NextApiResponse } from 'next'
import request from 'request'
import { URL } from 'url'

const { MAGENTO_URL = '' } = process.env

const MAGENTO_GRAPHQL_URL = new URL('graphql', MAGENTO_URL || '').href

export const config = {
    api: {
        bodyParser: false,
    },
}

export const GraphQLApi = (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
        if (req.method === 'POST') {
            req.pipe(request.post(MAGENTO_GRAPHQL_URL))
                .pipe(res)
                .on('error', reject)
                .on('response', resolve)
        } else {
            req.pipe(
                request.get({
                    qs: req.query,
                    url: MAGENTO_GRAPHQL_URL,
                    pool: {
                        maxSockets: Infinity,
                    },
                })
            )
                .pipe(res)
                .on('error', reject)
                .on('response', resolve)
        }
    })
}

export default GraphQLApi
