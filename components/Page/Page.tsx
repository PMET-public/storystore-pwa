import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root, Heading } from './Page.styled'
import useNetworkStatus from '~/hooks/useNetworkStatus'
import { PageSkeleton } from './Page.skeleton'
import { QueryResult } from '@apollo/client'

const Head = dynamic(() => import('~/components/Head'))
const Link = dynamic(() => import('~/components/Link'))
const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'))

export const Page: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const { page } = data || {}

    if (!online && !page) return <Error type="Offline" fullScreen />

    if (!loading && !page) {
        return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
    }

    return (
        <React.Fragment>
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>
                {loading && !page?.content ? (
                    <PageSkeleton />
                ) : (
                    <React.Fragment>
                        {page.heading && <Heading>{page.heading}</Heading>}
                        <PageBuilder html={page.content} />
                    </React.Fragment>
                )}
            </Root>
        </React.Fragment>
    )
}
