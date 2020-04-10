import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'

import { usePage } from './usePage'
import useNetworkStatus from '../../hooks/useNetworkStatus'

import PageTemplate from '@pmet-public/luma-ui/dist/templates/Page'

const Head = dynamic(() => import('../Head'))
const Link = dynamic(() => import('../Link'))
const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../../components/PageBuilder'))

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const online = useNetworkStatus()

    const { queries } = usePage({ id })

    const { page } = queries.page.data || {}

    if (!online && !page) return <Error type="Offline" />

    if (!queries.page.loading && !page) {
        return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />
    }
    return (
        <React.Fragment>
            {page && (
                <Head
                    title={page.metaTitle || page.title}
                    description={page.metaDescription}
                    keywords={page.metaKeywords}
                />
            )}

            <PageTemplate loading={queries.page.loading}>
                {page?.content && <PageBuilder html={page.content} />}
            </PageTemplate>
        </React.Fragment>
    )
}
