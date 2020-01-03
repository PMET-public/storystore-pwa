import request, { RequestCallback } from 'request'
import { URL } from 'url'

const { MAGENTO_URL = '' } = process.env

const MAGENTO_GRAPHQL_URL = new URL('graphql', MAGENTO_URL).href

export const config = {
    api: {
        bodyParser: false,
    },
}

export const GraphQLApi: RequestCallback = (req, res) => {
    if (req.method === 'POST') {
        req.pipe(request.post(MAGENTO_GRAPHQL_URL)).pipe(res)
    } else {
        req.pipe(
            request.get({
                qs: req.query,
                url: MAGENTO_GRAPHQL_URL,
                pool: {
                    separateReqPool: { maxSockets: 20 },
                },
            })
        ).pipe(res)
    }
}

export default GraphQLApi
