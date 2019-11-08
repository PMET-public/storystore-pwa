import React, { FunctionComponent, useMemo } from 'react'
import dynamic from 'next/dynamic'

import { useUrlResolver } from './useUrlResolver'
import { useRouter } from 'next/router'

import ViewLoader from 'luma-ui/dist/components/ViewLoader'

const Error = dynamic(() => import('../Error'))
const Page = dynamic(() => import('../Page '))
const Category = dynamic(() => import('../Category'))
const Product = dynamic(() => import('../Product'))

type ResolverProps = {}

export const UrlResolver: FunctionComponent<ResolverProps> = ({}) => {
    const router = useRouter()

    const url = router.query.url as string

    const { loading, error, online, data } = useUrlResolver({ url })

    const urlKey = useMemo(
        () =>
            url
                .toString()
                .split('/')
                .pop() || '',
        [url]
    )

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500">{error.message}</Error>

    if (loading) return <ViewLoader />

    if (!data.urlResolver) return <Error type="404" />

    const { type, content_id } = data.urlResolver

    switch (type) {
        case 'CMS_PAGE':
            return <Page id={content_id} />
        case 'CATEGORY':
            return <Category id={content_id} />
        case 'PRODUCT':
            return <Product urlKey={urlKey} />
        default:
            return <Error type="500">`Internal Error: ${type} is not valid`</Error>
    }
}
