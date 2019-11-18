import React from 'react'
import { graphQlUri } from '../apollo/client'
import { NextComponentType } from 'next'
import UrlResolverComponent, { ResolverProps } from '../components/UrlResolver'

const UrlResolver: NextComponentType<any, any, ResolverProps> = ({ contentId, type, url }) => {
    return <UrlResolverComponent type={type} url={url} contentId={contentId} />
}

UrlResolver.getInitialProps = async ({ query }) => {
    const [url] = query.url.toString().split('?')

    const graphQlQuery = `query%20%7B%0A%20%20urlResolver(url:%20"${url}")%20%7B%0A%20%20%20%20contentId:%20id%0A%20%20%20%20type%0A%20%20%7D%0A%7D&variables=%7B"id":20,"categoryId":2%7D`

    const res = await fetch(`${graphQlUri}?query=${graphQlQuery}`)

    const { data = {} } = await res.json()

    return { ...data.urlResolver, url }
}

export default UrlResolver
