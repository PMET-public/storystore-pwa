import React, { FunctionComponent } from 'react'
import gql from 'graphql-tag'

import { useRouter } from 'next/router'
import { useQuery } from '@apollo/react-hooks'

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
        throw new Error(error.message)
    }

    if (!urlResolver) {
        router.push({ pathname: '/_404' })
        return null
    }

    const { type, id } = urlResolver

    return (
        <React.Fragment>
            <h2>URL Resolver</h2>
            url: {url}<br />
            type: {type} <br />
            id: {id}
        </React.Fragment>
    )
}

export default Resolver
