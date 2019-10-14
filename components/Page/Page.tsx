import React, { FunctionComponent } from 'react'
import { usePage } from './usePage'

import DocumentMetadata from '../../components/DocumentMetadata'
import Error from 'next/error'
import PageTemplate from 'luma-ui/dist/templates/Page'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, error, data } = usePage({ id })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!data.page) {
        return <Error statusCode={404} />
    }

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
