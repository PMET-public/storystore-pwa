import React, { FunctionComponent } from 'react'
import { usePage } from './usePage'

import DocumentMetadata from '../../components/DocumentMetadata'
import Error from '../Error'
import PageTemplate from 'luma-ui/dist/templates/Page'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, error, data, online } = usePage({ id })

    if (error && !online) <Error type="Offline" />

    if (!data.page && loading) return <ViewLoader />

    if (error) return <Error type="500">{error.message}</Error>

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
