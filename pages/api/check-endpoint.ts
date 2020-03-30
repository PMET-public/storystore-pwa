import fetch from 'node-fetch'
import { URL } from 'url'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
    api: {
        bodyParser: false,
    },
}

enum ErrorMessages {
    'NOT_FOUND' = '🤔 Magento Instance not found. Please check the URL and try again.',
    'INTERNAL' = '🥴 There is an issue connecting to the Magento Instance. Please try again later.',
    'INVALID_SCHEMA' = "🧐 There is an issue with the Magento Instance's GraphQL schema. Please make sure you are using Magento 2.3.4 of above.",
    'INVALID_URL' = '😑 Invalid URL. Please try again.',
    'UNAUTHENTICATED' = `🔐 The Magento Instance is private. Don't forget to include credentials. i.e. https://user@password:...".`,
}

enum ErrorLevels {
    'WARNING' = 'warning',
    'NOTICE' = 'notice',
    'ERROR' = 'error',
}

enum Fields {
    'MAGENTO_URL' = 'MAGENTO_URL',
}

export type ErrorResponse = {
    level: ErrorLevels
    key: Fields
    message: string
}

export type Response = {
    errors?: Array<ErrorResponse>
}

export const CheckEndpointApi = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
    const url = req.query.url?.toString()

    if (!url) {
        res.status(422)

        res.send({
            errors: [
                {
                    level: ErrorLevels.ERROR,
                    key: Fields.MAGENTO_URL,
                    message: ErrorMessages.INVALID_URL,
                },
            ],
        })

        return
    }

    const graphQLQuery = encodeURI(
        `
        query {
            categoryList{
                id
            }
        }
    `
            .replace(/ +(?= )/g, '')
            .replace(/\n/g, '')
    )

    let MAGENTO_URL

    try {
        MAGENTO_URL = new URL(`graphql?query=${graphQLQuery}`, url).href
    } catch (err) {
        return res.status(422).send({
            errors: [
                {
                    level: ErrorLevels.ERROR,
                    key: Fields.MAGENTO_URL,
                    message: ErrorMessages.INVALID_URL,
                },
            ],
        })
    }

    try {
        const response = await fetch(MAGENTO_URL)

        res.status(response.status)

        /**
         * Unauthenticated
         */
        if (response.status === 401) {
            return res.send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.MAGENTO_URL,
                        message: ErrorMessages.UNAUTHENTICATED,
                    },
                ],
            })
        }

        const { data } = await response.json()

        /**
         * Check if category list exist – this is only available in Magento 2.3.4 and above,
         * and required in Story Storefront
         */
        if (!data.categoryList?.shift().id) {
            return res.send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.MAGENTO_URL,
                        message: ErrorMessages.INVALID_SCHEMA,
                    },
                ],
            })
        }

        /**
         * Other tests...
         */

        const errors: ErrorResponse[] = []

        // ... ohter test here

        return res.send({ errors: errors.length ? errors : undefined })
    } catch (error) {
        /**
         * Not Found
         */
        if (error.code === 'ENOTFOUND') {
            return res.status(404).send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.MAGENTO_URL,
                        message: ErrorMessages.NOT_FOUND,
                    },
                ],
            })
        }

        console.error(error)

        return res.status(500).send({
            errors: [
                {
                    level: ErrorLevels.ERROR,
                    key: Fields.MAGENTO_URL,
                    message: ErrorMessages.INTERNAL,
                },
            ],
        })
    }
}

export default CheckEndpointApi
