import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'

import { usePage } from './usePage'
import useNetworkStatus from '../../hooks/useNetworkStatus'

import PageTemplate from '@pmet-public/luma-ui/dist/templates/Page'
import Link from '../Link'
import Head from '../Head'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../../components/PageBuilder'))

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, data } = usePage({ id })

    const online = useNetworkStatus()

    if (!online && !data.page) return <Error type="Offline" />

    if (!loading && !data.page) return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />

    const { page } = data

    return (
        <React.Fragment>
            {page && (
                <Head
                    title={page.metaTitle || page.title}
                    description={page.metaDescription}
                    keywords={page.metaKeywords}
                />
            )}

            <PageTemplate loading={loading}>{page?.content && <PageBuilder html={page.content} />}</PageTemplate>
        </React.Fragment>
    )
}
