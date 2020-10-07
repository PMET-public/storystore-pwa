import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root } from './Home.styled'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { HomeSkeleton } from './Home.skeleton'
import Head from '~/components/Head'
import { QueryResult } from '@apollo/client'

const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'))

export const Home: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const { page } = data || {}

    if (!online && !data?.page) {
        return <Error type="Offline" fullScreen />
    }

    if (!loading && !page) {
        return <Error type="404">Page not found</Error>
    }

    return (
        <React.Fragment>
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>{loading && !page ? <HomeSkeleton /> : page.content && <PageBuilder html={page.content} />}</Root>
        </React.Fragment>
    )
}
