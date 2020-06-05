import { magentoDependency } from '~/package.json'
import { NextApiRequest, NextApiResponse } from 'next'
import createApolloClient from '~/lib/apollo/client'
import gql from 'graphql-tag'
import semver from 'semver'
import { URL } from 'url'

export const config = {
    api: {
        bodyParser: false,
    },
}

enum ErrorMessages {
    'INVALID_URL' = '😑 Please enter the URL to your Magento instance.',
    'NOT_FOUND' = '🤔 Not found. Please check the URL and try again.',
    'MISSING_STORYSTORE' = `🤔 This Magento instance is missing the StoryStore Module.`,
    'UNAUTHENTICATED' = `🔐 This Magento instance is private. Don't forget to include credentials. e.g. https://user@password:...".`,
    'INTERNAL' = '🥴 There is an issue connecting to the Magento instance. Please try again later.',
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
    magentoVersion?: string
    magentoDependency?: string
    storyStoreModule?: boolean
    redirectTo?: string
    errors?: ErrorResponse[]
}

export const CheckEndpointApi = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
    if (!magentoDependency) throw Error()

    const url = req.query.url?.toString()
    const includeOtherReleases = Number(req.query.includeOtherReleases ?? 1)

    if (!url) {
        return res.status(400).send({
            errors: [
                {
                    level: ErrorLevels.ERROR,
                    key: Fields.magentoUrl,
                    message: ErrorMessages.INVALID_URL,
                },
            ],
        })
    }

    try {
        const apolloClient = createApolloClient(url)

        const { data } = await apolloClient.query({
            query: gql`
                query GetMagentoVersion {
                    storeConfig {
                        id
                        version: storystore_pwa_magento_version
                    }
                }
            `,
            errorPolicy: 'ignore',
        })

        // Get version of Magento Instance
        const magentoVersion = semver.coerce(data?.storeConfig.version)?.version ?? '2.3.4'
        // Check if the StoryStory Module is installed
        const storyStoreModule = Boolean(data?.storeConfig.version)

        // Releases Redirect URLS
        const latestReleaseRedirectUrl = process.env.LATEST_RELEASE_REDIRECT_URL && new URL(process.env.LATEST_RELEASE_REDIRECT_URL)
        const prevReleaseRedirectUrl = process.env.PREV_RELEASE_REDIRECT_URL && new URL(process.env.PREV_RELEASE_REDIRECT_URL)

        // TODO: Comment
        if (includeOtherReleases === 1 && latestReleaseRedirectUrl && req.headers.host !== latestReleaseRedirectUrl.host) {
            const latest = await fetch(new URL(`/api/check-endpoint?url=${url}&includeOtherReleases=0`, latestReleaseRedirectUrl.href).href).then(r => r.json())

            if (!latest.errors) {
                return res.send({
                    ...latest,
                    redirectTo: latestReleaseRedirectUrl.href,
                })
            }
        }

        // If the Magento Instance is supported ...
        if (!semver.satisfies(magentoVersion, magentoDependency)) {
            res.status(422)

            /** ... lets check if the previous release supports this version of Magento */
            if (includeOtherReleases === 1 && prevReleaseRedirectUrl && req.headers.host !== prevReleaseRedirectUrl.host) {
                const prev = await fetch(new URL(`/api/check-endpoint?url=${url}&includeOtherReleases=0`, prevReleaseRedirectUrl).href).then(r => r.json())

                if (!prev.errors) {
                    return res.send({
                        ...prev,
                        redirectTo: prevReleaseRedirectUrl.href,
                    })
                }
            }

            return res.send({
                magentoVersion,
                magentoDependency,
                storyStoreModule,
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.magentoUrl,
                        message: `Magento ${magentoVersion} is not supported by this Storefront. Please use Magento ${magentoDependency}.`,
                    },
                ],
            })
        }

        // 👌 All good!
        return res.send({
            magentoVersion,
            magentoDependency,
            storyStoreModule,
        })
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
}

export default CheckEndpointApi
