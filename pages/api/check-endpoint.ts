import { magentoDependency } from '~/package.json'
import { NextApiRequest, NextApiResponse } from 'next'
import { initializeApollo } from '~/lib/apollo/client'
import gql from '@apollo/client'
import semver from 'semver'
import { URL } from 'url'

export const config = {
    api: {
        bodyParser: false,
    },
}

export const ErrorMessages = {
    INVALID_URL: '😑 Please enter the URL to your Magento.',
    NOT_FOUND: '🤔 Not found. Please check the URL and try again.',
    MISSING_STORYSTORE: `🤔 Your Magento is missing the StoryStore Module.`,
    UNAUTHENTICATED: `🔐 This URL is private. Don't forget to include credentials. e.g. https://user@password:...".`,
    INTERNAL: '🥴 There is an issue connecting to your Magento. Please try again later.',
    DEPRECATED: (version: string) => `Magento ${version} is deprecated. Please use Magento ${magentoDependency}.`,
}

export enum ErrorLevels {
    'WARNING' = 'warning',
    'NOTICE' = 'notice',
    'ERROR' = 'error',
}

export enum Fields {
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
    redirectToPrevious?: string
    redirectToLatest?: string
    missingStoryStore?: boolean
    upgrade?: boolean
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
        const apolloClient = initializeApollo(url)

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

        // Releases Redirect URLS
        const latestReleaseRedirectUrl = process.env.LATEST_RELEASE_REDIRECT_URL && new URL('/settings', process.env.LATEST_RELEASE_REDIRECT_URL)
        const prevReleaseRedirectUrl = process.env.PREV_RELEASE_REDIRECT_URL && new URL('/settings', process.env.PREV_RELEASE_REDIRECT_URL)
        const missingStoryStore = !data
        const upgrade = (latestReleaseRedirectUrl && req.headers.host !== latestReleaseRedirectUrl.host) || undefined

        let redirectToPrevious, redirectToLatest

        // If request is coming from the Previous environment, check if the Latest environment supports it.
        if (includeOtherReleases === 1 && latestReleaseRedirectUrl && req.headers.host !== latestReleaseRedirectUrl.host) {
            try {
                const latest = await fetch(new URL(`/api/check-endpoint?url=${url}&includeOtherReleases=0`, latestReleaseRedirectUrl.href).href).then(r => r.json())
                if (!latest.errors) {
                    redirectToLatest = latestReleaseRedirectUrl.href
                }
            } catch (error) {}
        }

        // If the Magento Instance is not supported ...
        if (!semver.satisfies(magentoVersion, magentoDependency)) {
            res.status(426)

            /** ... lets check if the previous release supports this version of Magento */
            if (includeOtherReleases === 1 && prevReleaseRedirectUrl && req.headers.host !== prevReleaseRedirectUrl.host) {
                try {
                    const prev = await fetch(new URL(`/api/check-endpoint?url=${url}&includeOtherReleases=0`, prevReleaseRedirectUrl).href).then(r => r.json())

                    if (!prev.errors) {
                        redirectToPrevious = prevReleaseRedirectUrl.href
                    }
                } catch (error) {}
            }

            return res.send({
                magentoVersion,
                magentoDependency,
                redirectToPrevious,
                redirectToLatest,
                missingStoryStore,
                upgrade,
                errors: [
                    {
                        level: ErrorLevels.ERROR,
                        key: Fields.magentoUrl,
                        message: ErrorMessages.DEPRECATED(magentoVersion),
                    },
                ],
            })
        }

        // 👌 All good!
        return res.send({
            magentoVersion,
            magentoDependency,
            redirectToPrevious,
            redirectToLatest,
            missingStoryStore,
            upgrade,
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
