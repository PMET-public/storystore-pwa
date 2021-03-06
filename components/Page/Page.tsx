import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root, Heading } from './Page.styled'
import useNetworkStatus from '~/hooks/useNetworkStatus'
import { PageSkeleton } from './Page.skeleton'
import { useQuery } from '@apollo/client'
import { PAGE_QUERY } from '.'

const Head = dynamic(() => import('~/components/Head'))
const Link = dynamic(() => import('~/components/Link'))
const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'))

export type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, data } = useQuery(PAGE_QUERY, { variables: { id } })
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
