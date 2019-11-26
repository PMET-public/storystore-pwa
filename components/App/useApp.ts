import { useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import { writeInLocalStorage } from '../../lib/localStorage'

import APP_QUERY from './graphql/app.graphql'
// import CART_QUERY from './graphql/cart.graphql'
import CREATE_EMPTY_CART_MUTATION from './graphql/createEmptyCart.graphql'

const categoryId = LUMA_ENV.CONTENT_PARENT_CATEGORIES_ID
const footerBlockId = LUMA_ENV.CONTENT_FOOTER_BLOCK_ID

export const useApp = () => {
    const query = useQuery(APP_QUERY, {
        fetchPolicy: 'cache-first',
        returnPartialData: true,
        variables: {
            categoryId,
            footerBlockId,
            hasFooter: !!footerBlockId,
        },
    })

    /**
     * No Cart no problem. Let's create one
     */

    const [createEmptyCart, { loading: creatingEmptyCart }] = useMutation(CREATE_EMPTY_CART_MUTATION, {
        update: (cache, { data: { cartId } }) => {
            writeInLocalStorage('cartId', cartId)

            cache.writeData({
                data: { cartId },
            })
        },
    })

    useEffect(() => {
        if (query.loading || creatingEmptyCart) return

        if (query.error || (query.data && query.data.hasCart === false)) {
            createEmptyCart().then(() => query.refetch())
        }
    }, [query.error, query.data])

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
        data: query.data && {
            ...query.data,
            // ...cartQuery.data,
            footer: query.data.footer && query.data.footer.items[0],
        },
        api: {
            isUrlActive: handleIsUrlActive,
        },
    }
}
