import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'

import Error from 'next/error'
import DocumentMetadata from '../components/DocumentMetadata'
import Page from 'luma-ui/dist/templates/Page'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

const QUERY = gql`
    query PageQuery($id: Int!) {
        page: cmsPage(id: $id) {
            title
            content
        }

        meta: cmsPage(id: $id) {
            description: meta_description
            keywords: meta_keywords
            title: meta_title
        }

        store: storeConfig {
            id
            titlePrefix: title_prefix
            titleSuffix: title_suffix
        }
    }
`

type CMSPageProps = {
    id: number
}

const CMSPage: FunctionComponent<CMSPageProps> = ({ id }) => {
    const { loading, error, data } = useQuery(QUERY, {
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
            <Page
                pageBuilder={{
                    html: page.content,
                }}
            />
        </React.Fragment>
    )
}

export default CMSPage
