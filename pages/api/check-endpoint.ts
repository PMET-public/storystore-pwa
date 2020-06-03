import { engines } from '~/package.json'
import { NextApiRequest, NextApiResponse } from 'next'
import createApolloClient from '~/lib/apollo/client'
import gql from 'graphql-tag'
import semver from 'semver'

export const config = {
    api: {
        bodyParser: false,
    },
}

enum ErrorMessages {
    'INVALID_URL' = '😑 Invalid URL. Please try again.',
    'NOT_FOUND' = '🤔 Not found. Please check the URL and try again.',
    'MISSING_STORYSTORE' = `🤔 This Magento Instance seems to be missing the StoryStore Module. Please install and try again.`,
    'UNAUTHENTICATED' = `🔐 This Magento Instance is private. Don't forget to include credentials. e.g. https://user@password:...".`,
    'INTERNAL' = '🥴 There is an issue connecting to the Magento Instance. Please try again later.',
}

enum ErrorLevels {
    'WARNING' = 'warning',
    'NOTICE' = 'notice',
    'ERROR' = 'error',
}

enum Fields {
    'magentoUrl' = 'magentoUrl',
}

export type ErrorResponse = {
    level: ErrorLevels
    key: Fields
    message: string
}

export type Response = {
    errors?: ErrorResponse[]
}

export const CheckEndpointApi = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
    const url = req.query.url?.toString()

    if (!url) {
        res.status(406)

        res.send({
            errors: [
                {
                    level: ErrorLevels.ERROR,
                    key: Fields.magentoUrl,
                    message: ErrorMessages.INVALID_URL,
                },
            ],
        })

        return
    }

    try {
        const apolloClient = createApolloClient(url)

        const { data } = await apolloClient.query({
            query: gql`
                query GetMagentoVersion {
                    storeConfig {
                        id
                        # version: storystore_magento_version
                    }
                }
            `,
        })

        const version = data?.version

        if (!semver.satisfies(version, engines.magento)) {
            // Redirect to Previous URL if available
            // TODO Return error message warning the user to upgrade to latest.
            if (process.env.PREV_URL) {
                res.writeHead(302, {
                    Location: process.env.PREV_UR,
                })
            }

            return res.status(406).send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.magentoUrl,
                        message: `Sorry, Magento ${version} is not supported by this Storefront. Please make sure to use Magento ${engines.magento}.`,
                    },
                ],
            })
        }
    } catch (error) {
        res.status(error.networkError?.statusCode ?? 500)

        /** Not Found */
        if (error.networkError?.code === 'ENOTFOUND') {
            return res.send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.magentoUrl,
                        message: ErrorMessages.NOT_FOUND,
                    },
                ],
            })
        }

        /** Unauthenticated */
        if (error.networkError?.statusCode === 401) {
            return res.send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.magentoUrl,
                        message: ErrorMessages.UNAUTHENTICATED,
                    },
                ],
            })
        }

        /** Missing StoryStore */
        if (error.graphQLErrors) {
            return res.send({
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.magentoUrl,
                        message: ErrorMessages.MISSING_STORYSTORE,
                    },
                ],
            })
        }

        return res.send({
            errors: [
                {
                    level: ErrorLevels.ERROR,
                    key: Fields.magentoUrl,
                    message: ErrorMessages.INTERNAL,
                },
            ],
        })
    }

    return res.send({ errors: undefined })
}

export default CheckEndpointApi
