import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'

import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

import Page from '../components/Page'
import Category from '../components/Category'
import Product from '../components/Product'

const QUERY = gql`
    query urlResolver($url: String!) {
        urlResolver(url: $url) {
            id: canonical_url # <- This is
            content_id: id # Apollo Client Cache uses id to index its cache. Id is not unique across multiple types
            type
        }
    }
`
type ResolverProps = {}

const Resolver: FunctionComponent<ResolverProps> = ({}) => {
    const router = useRouter()

    const { url } = router.query

    const { loading, error, data } = useQuery(QUERY, {
        variables: { url },
        fetchPolicy: 'cache-and-network',
    })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!data.urlResolver) {
        return <Error statusCode={404} />
    }

    const { type, content_id } = data.urlResolver

    switch (type) {
        case 'CMS_PAGE':
            return <Page id={content_id} />
        case 'CATEGORY':
            return <Category id={content_id} />
        case 'PRODUCT':
            return <Product id={content_id} />
        default:
            return <Error statusCode={500} />
    }
}

export default Resolver
