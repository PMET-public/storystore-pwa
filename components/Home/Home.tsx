import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root } from './Home.styled'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { HomeSkeleton } from './Home.skeleton'
import Head from '~/components/Head'
import { useQuery } from '@apollo/client'
import { HOME_PAGE_QUERY } from '.'

const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'))

export type HomeProps = {
    id?: string
}

export const Home: FunctionComponent<HomeProps> = ({ id }) => {
    const online = useNetworkStatus()

    const { loading, data } = useQuery(HOME_PAGE_QUERY, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'cache-first',
    })

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
