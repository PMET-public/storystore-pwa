import React, { FunctionComponent } from 'react'
import usePage from '../../api/usePage'

import Error from 'next/error'
import DocumentMetadata from '../DocumentMetadata'
import PageTemplate from 'luma-ui/dist/templates/Page'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { query } = usePage({ id })

    if (query.loading) {
        return <ViewLoader />
    }

    if (query.error) {
        console.error(query.error.message)
        return <Error statusCode={500} />
    }

    if (!query.data.page) {
        return <Error statusCode={404} />
    }

    const { page, meta, store } = query.data

    return (
        <React.Fragment>
            <DocumentMetadata
                title={[store.titlePrefix, meta.title || page.title, store.titleSuffix]}
                description={meta.description}
                keywords={meta.keywords}
            />
            <PageTemplate
                pageBuilder={{
                    html: page.content,
                }}
            />
        </React.Fragment>
    )
}
