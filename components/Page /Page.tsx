import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root } from './Page.styled'

import useNetworkStatus from '~/hooks/useNetworkStatus'

import { PageProps } from './usePage'
import { PageSkeleton } from './Page.skeleton'

const Head = dynamic(() => import('~/components/Head'))
const Link = dynamic(() => import('~/components/Link'))
const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'), { ssr: false })

export const Page: FunctionComponent<PageProps> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const { page } = data || {}

    if (!online && !page) return <Error type="Offline" fullScreen />

    if (!loading && !page) {
        return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
    }

    return (
        <React.Fragment>
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>{loading && !page?.content ? <PageSkeleton /> : <PageBuilder html={page.content} />}</Root>
        </React.Fragment>
    )
}
