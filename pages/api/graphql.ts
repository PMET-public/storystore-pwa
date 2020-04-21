import { COOKIE } from '~/lib/cookies'
import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
    api: {
        bodyParser: false,
    },
}

export const GraphQLApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const settings = {
        magentoUrl: process.env.MAGENTO_URL,
        ...JSON.parse(req.cookies[COOKIE.settings] || '{}'),
    }

    const magentoUrl = new URL('graphql', settings.magentoUrl).href

    req.pipe(
        request(
            {
                url: magentoUrl,
                qs: req.query,
                method: req.method,
                pool: {
                    maxSockets: Infinity,
                },
            },
            error => {
                if (error) {
                    if (error.code === 'ENOTFOUND') res.status(404)
                    else {
                        console.error(error)
                        res.status(500)
                    }
                    res.end()
                    return
                }
            }
        )
    ).pipe(res)
}

export default GraphQLApi
