import React from 'react'
import { NextComponentType } from 'next'
import { overrideSettingsFromCookie } from '../lib/overrideFromCookie'

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
}

UrlResolver.getInitialProps = async ({ req, res, query }) => {
    let { type, contentId, urlKey } = query

    if (type && (contentId || urlKey)) {
        return { type, contentId, urlKey }
    }

    try {
        const graphQLUrl = process.browser
            ? new URL('/api/graphql', location.href).href
            : new URL(
                  'graphql',
                  {
                      MAGENTO_URL: process.env.MAGENTO_URL,
                      ...overrideSettingsFromCookie('MAGENTO_URL')(req?.headers.cookie),
                  }.MAGENTO_URL
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

    return { type, contentId, urlKey }
}

export default UrlResolver
