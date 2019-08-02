import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'
import dynamic from 'next/dynamic'

import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'

import Error from 'next/error'

const CMSPage = dynamic(() => import('../templates/cms_page'))
const Category = dynamic(() => import('../templates/category'))
const Product = dynamic(() => import('../templates/product'))

const QUERY = gql`
    query urlResolver($url: String!){
        urlResolver(url:$url) {
            type
            id
        }
    }
`
type ResolverProps = { }

const Resolver: FunctionComponent<ResolverProps> = ({ }) => {
    const router = useRouter()
    
    const { url } = router.query

    const { loading, error, data: { urlResolver } } = useQuery<any>(QUERY, {
        variables: { url },
        fetchPolicy: 'cache-first',
    })

    if (loading) {
        return <div>Loading</div>
    }

    if (error) {
        return <Error statusCode={500} />
    }

    if (!urlResolver) {
        return <Error statusCode={404} />
    }

    const { type, id } = urlResolver

    switch (type) {
        case 'CMS_PAGE':
            return <CMSPage id={id} />
        case 'CATEGORY':
            return <Category id={id} />
        case 'PRODUCT':
            return <Product id={id} />
        default:
            return <Error statusCode={500} />
    }
}

export default Resolver
