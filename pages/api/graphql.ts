import request, { RequestCallback } from 'request'

import { URL } from 'url'

const magentoUrl = process.env.magentoUrl

const magentoGraphQlUrl = new URL('graphql', magentoUrl).href

export const config = {
    api: {
        bodyParser: false,
    },
}

export const GraphQLApi: RequestCallback = (req, res) => {
    return new Promise((resolve, reject) => {
        if (req.method === 'POST') {
            req.pipe(request.post(magentoGraphQlUrl))
                .pipe(res)
                .on('error', reject)
                .on('response', resolve)
        } else {
            req.pipe(
                request.get({
                    qs: req.query,
                    url: magentoGraphQlUrl,
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
