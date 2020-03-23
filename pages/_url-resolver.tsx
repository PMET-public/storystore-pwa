import React from 'react'
import dynamic from 'next/dynamic'
import { NextComponentType } from 'next'

import Link from '../components/Link'

const Error = dynamic(() => import('../components/Error'))
const Page = dynamic(() => import('../components/Page '))
const Category = dynamic(() => import('../components/Category'))
const Product = dynamic(() => import('../components/Product'))

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

export default UrlResolver
