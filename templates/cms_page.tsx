import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'

import Page from 'luma-storybook/dist/templates/Page'
import Error from 'next/error'
import DocumentMetadata from '../components/DocumentMetadata'
import ViewLoader from 'luma-storybook/dist/components/ViewLoader'

const QUERY = gql`
    query PageQuery($id: Int!) {
        cmsPage(id: $id) {
            meta_description
            meta_keywords
            title
            content
        }
    }
`

type CMSPageProps = {
    id: number
}

const CMSPage: FunctionComponent<CMSPageProps> = ({ id }) => {
    const { loading, data } = useQuery(QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
    })

    if (loading) return <ViewLoader />

    if (!data.cmsPage) return <Error statusCode={404} />

    const {
        meta_description,
        meta_keywords,
        title,
        content,
    } = data.cmsPage

    return (
        <React.Fragment>
            <DocumentMetadata
                description={meta_description}
                keywords={meta_keywords}
                title={title}
            />

            <Page
                assembler={{
                    components: [
                        {
                            name: 'Html',
                            props: {
                                source: content,
                            },
                        },
                    ]
                }}
            />

        </React.Fragment>
    )
}

export default CMSPage
