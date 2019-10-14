import { useEffect, useCallback } from 'react'
import useNetworkUpdates from '../../hooks/useNetworkUpdates'
import { useApolloClient, useQuery, useMutation } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
import CREATE_EMPTY_CART from './graphql/createEmptyCart.graphql'

export const useApp = (props: { categoryId: number }) => {
    const { categoryId } = props

    const client = useApolloClient()

    const query = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-first',
        variables: {
            cartId: '', // @client
            hasCart: true, // @client
            categoryId,
        },
    })

    /**
     * Update Network State
     */
    useNetworkUpdates(isOnline => {
        client.writeData({ data: { isOnline } })
    })

    /**
     * No Cart no problem. Let's create one
     */
    const [createEmptyCart] = useMutation(CREATE_EMPTY_CART, {
        update: (cache, { data: { cartId } }) => {
            writeInLocalStorage('cartId', cartId)

            cache.writeData({
                data: { cartId },
            })
        },
    })

    useEffect(() => {
        if (query.data) {
            const { hasCart } = query.data
            if (!hasCart) createEmptyCart()
        }
    }, [query.data && query.data.cartId])

    /**
     * Handle Active URL Check
     */
    const { route, query: urlQuery } = useRouter()

    const handleIsUrlActive = useCallback(
        (href: string) => {
            return href === (urlQuery.url || route)
        },
        [urlQuery.url, route]
    )

    return {
        ...query,
        api: {
            isUrlActive: handleIsUrlActive,
        },
    }
}
