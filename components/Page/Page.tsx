import React, { FunctionComponent } from 'react'
import PAGE_QUERY from './pageQuery.graphql'

import { useQuery } from '@apollo/react-hooks'

import Error from 'next/error'
import DocumentMetadata from '../DocumentMetadata'
import PageTemplate from 'luma-ui/dist/templates/Page'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type PageProps = {
    id: number
}

export const Page: FunctionComponent<PageProps> = ({ id }) => {
    const { loading, error, data } = useQuery(PAGE_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
    })

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

    const { page, meta, store } = data

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
