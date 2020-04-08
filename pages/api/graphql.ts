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

    req.pipe(
        request(
            {
                url: MAGENTO_URL,
                qs: req.query,
                method: req.method,
                rejectUnauthorized: false,
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
