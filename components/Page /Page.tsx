import React, { FunctionComponent } from 'react'
import { usePage } from './usePage'

import DocumentMetadata from '../../components/DocumentMetadata'
import Error from '../Error'
import PageTemplate from '@pmet-public/luma-ui/dist/templates/Page'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import Link from '../Link'
import PageBuilder from '../../components/PageBuilder'

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, error, data, online, refetch } = usePage({ id })

    if (error && !online) <Error type="Offline" />

    if (error) return <Error type="500" button={{ text: 'Try again', onClick: refetch }} />

    if (loading && !data.page) return <ViewLoader />

    if (!loading && !data.page) return <Error type="404" button={{ text: 'Look around', as: Link, href: '/' }} />

    const { page } = data

    return (
        <React.Fragment>
            <DocumentMetadata
                title={page.metaTitle || page.title}
                description={page.metaDescription}
                keywords={page.metaKeywords}
            />

            <PageTemplate>
                <PageBuilder html={page.content} />
            </PageTemplate>
        </React.Fragment>
    )
}
