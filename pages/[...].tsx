import UrlResolver, { CONTENT_TYPE } from './_url-resolver'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'

UrlResolver.getInitialProps = async ({ ctx: { req, res, query } }) => {
    let { type, contentId, urlKey } = query

    if (type && (contentId || urlKey)) {
        return { type, contentId, urlKey }
    }

    const settings = {
        MAGENTO_URL: process.env.MAGENTO_URL,
        ...overrideSettingsFromCookie('MAGENTO_URL')(req?.headers),
    }

    try {
        const graphQLUrl = process.browser
            ? new URL('/api/graphql', location.href).href
            : new URL('graphql', settings.MAGENTO_URL).href

        const url = query.url ? query.url.toString().split('?')[0] : (query[''] as string[]).join('/')

        const graphQlQuery = encodeURI(
            `
                query {
                    urlResolver(url: "${url}") {
                        id
                        contentId: id
                        type
                        urlKey: relative_url
                    }
                }
            `
                .replace(/ +(?= )/g, '')
                .replace(/\n/g, '')
        )

        const page = await fetch(`${graphQLUrl}?query=${graphQlQuery}`)

        const { data = {} } = await page.json()

        type = data.urlResolver.type || CONTENT_TYPE.NOT_FOUND

        contentId = data.urlResolver.contentId

        urlKey = data.urlResolver.urlKey

        if (type === '404') res.statusCode = 404
    } catch (e) {
        res.statusCode = 500
    }

    return { type, contentId, urlKey }
}

export default UrlResolver
