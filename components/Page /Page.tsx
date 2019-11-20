import React, { FunctionComponent } from 'react'
import { usePage } from './usePage'

import DocumentMetadata from '../../components/DocumentMetadata'
import Error from '../Error'
import PageTemplate from '@pmet-public/luma-ui/dist/templates/Page'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, error, data, online } = usePage({ id })

    if (!data) return null

    if (error && !online) <Error type="Offline" />

    if (error) return <Error type="500">{error.message}</Error>

    if (!data.page && loading) return <ViewLoader />

    if (!data.page) return <Error type="404" />

    const { page } = data

    return (
        <React.Fragment>
            <DocumentMetadata
                title={page.metaTitle || page.title}
                description={page.metaDescription}
                keywords={page.metaKeywords}
            />

            <PageTemplate
                pageBuilder={{
                    html: page.content,
                }}
            />
        </React.Fragment>
    )
}
