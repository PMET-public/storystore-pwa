import request from 'request'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'
import { SETTINGS_OVERRIDE_COOKIE } from '../../lib/overrideFromCookie'

export const config = {
    api: {
        bodyParser: false,
    },
}

export const GraphQLApi = async (req: NextApiRequest, res: NextApiResponse) => {
    const settings = {
        MAGENTO_URL: process.env.MAGENTO_URL,
        ...JSON.parse(req.cookies[SETTINGS_OVERRIDE_COOKIE] || '{}'),
    }

    const MAGENTO_URL = new URL('graphql', settings.MAGENTO_URL).href

    try {
        if (req.method === 'POST') {
            req.pipe(request.post(MAGENTO_URL)).pipe(res)
        } else {
            req.pipe(
                request.get({
                    qs: req.query,
                    url: MAGENTO_URL,
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
