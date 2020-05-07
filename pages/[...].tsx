import React, { useMemo } from 'react'
import { withApollo } from '~/lib/apollo/withApollo'
import { NextComponentType } from 'next'
import { updateSettingsFromCookie } from '../lib/updateSettingsFromCookie'

import App from '~/components/App'
import Link from '../components/Link'
import Error from '../components/Error'
import Page from '../components/Page '
import Category from '../components/Category'
import Product from '../components/Product'

export enum CONTENT_TYPE {
    CMS_PAGE = 'CMS_PAGE',
    CATEGORY = 'CATEGORY',
    PRODUCT = 'PRODUCT',
    NOT_FOUND = '404',
}

export type ResolverProps = {
    contentId: number
    urlKey: string
    type: CONTENT_TYPE
}

const UrlResolver: NextComponentType<any, any, ResolverProps> = ({ type, contentId, urlKey }) => {
    const renderPage = useMemo(() => {
        if (!type) {
            return (
                <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                    Missing UrlResolver Type
                </Error>
            )
        }

        switch (type) {
            case 'CMS_PAGE':
                return <Page key={contentId} id={contentId} />
            case 'CATEGORY':
                return <Category key={contentId} id={contentId} />
            case 'PRODUCT':
                return <Product key={urlKey} urlKey={urlKey} />
            case '404':
                return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
            default:
                return (
                    <Error type="500" button={{ text: 'Reload', onClick: () => window.location.reload() }}>
                        Internal Error: {type} is not valid
                    </Error>
                )
        }
    }, [contentId, type, urlKey])

    return <App>{renderPage}</App>
}

// enable next.js ssr
UrlResolver.getInitialProps = async ({ req, res, query }) => {
    if (!Boolean(process.env.DEMO_MODE)) {
        res?.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    }

    const cookie = req?.headers.cookie

    let { type, contentId, urlKey } = query

    if (type && (contentId || urlKey)) {
        return { type, contentId, urlKey, cookie }
    }

    try {
        const graphQLUrl = process.browser
            ? new URL('/api/graphql', location.href).href
            : new URL(
                  'graphql',
                  updateSettingsFromCookie(
                      {
                          magentoUrl: process.env.MAGENTO_URL,
                      },
                      req?.headers.cookie
                  ).magentoUrl
              ).href

        const url = query.url ? query.url.toString().split('?')[0] : (query[''] as string[]).join('/')

        const graphQlQuery = encodeURI(
            `
                query {
                    urlResolver(url: "${url}") {
                        id
                        type
                        contentId: id
                    }
                }
            `
                .replace(/ +(?= )/g, '')
                .replace(/\n/g, '')
        )

        const page = await fetch(`${graphQLUrl}?query=${graphQlQuery}`)

        const { data = {} } = await page.json()

        type = data.urlResolver?.type || CONTENT_TYPE.NOT_FOUND

        contentId = data.urlResolver?.contentId

        urlKey = url.split('/').pop().split('.')[0]

        if (res && type === CONTENT_TYPE.NOT_FOUND) res.statusCode = 404
    } catch (e) {
        console.error(e)
        if (res) res.statusCode = 500
    }

    return { type, contentId, urlKey, storyStore: { cookie } }
}

export default withApollo(UrlResolver)
