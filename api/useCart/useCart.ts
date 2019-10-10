import { useReducer, Reducer, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/react-hooks'
import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'
import { getFromLocalStorage, writeInLocalStorage } from '../../lib/localStorage'

import CART_QUERY from './queries/cart.graphql'
import CREATE_CART_MUTATION from './queries/createCart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './queries/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './queries/removeCartItem.graphql'
import ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION from './queries/addSimpleProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './queries/addConfigurableProductsToCart.graphql'

type ReducerState = {
    cartId: string
    isUpdating: boolean
    isAdding: boolean
}

type ReducerActions =
    | {
          type: 'setCartId'
          payload: string
      }
    | {
          type: 'setAdding'
          payload: boolean
      }
    | {
          type: 'setUpdating'
          payload: boolean
      }

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'setCartId':
            return {
                ...state,
                cartId: action.payload,
            }
        case 'setUpdating':
            return {
                ...state,
                isUpdating: action.payload,
            }
        case 'setAdding':
            return {
                ...state,
                isAdding: action.payload,
            }
        default:
            throw `Reducer action not valid.`
    }
}

const initialState: ReducerState = {
    cartId: '',
    isAdding: false,
    isUpdating: false,
}

export const useCart = (props?: { pageId?: number }) => {
    const { pageId } = props || {}
    const withPage = !!pageId

    const client = useApolloClient()

    const [state, dispatch] = useReducer(reducer, initialState)

    const [createEmptyCart] = useMutation(CREATE_CART_MUTATION)

    const [updateCartItems] = useMutation(UPDATE_CART_ITEMS_MUTATION)

    const [removeCartItem] = useMutation(REMOVE_CART_ITEM_MUTATION)

    const [addSimpleProductsToCart] = useMutation(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION)

    const [addConfigurableProductsToCart] = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION)

    const query = useQuery(CART_QUERY, {
        skip: !state.cartId,
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
        variables: { cartId: state.cartId, withPage, pageId },
    })

    /**
     * Handle New Carts
     */
    useEffect(() => {
        const cartId = getFromLocalStorage('cartId') || ''
        console.log({ cartId })
        if (!cartId) {
            createEmptyCart().then(({ data: { cartId } }) => {
                writeInLocalStorage('cartId', cartId)
                dispatch({ type: 'setCartId', payload: cartId })
            })
        } else {
            dispatch({ type: 'setCartId', payload: cartId })
        }
    }, [])

    useEffect(() => {
        if (query.data && query.data.cart && query.data.cart.items) {
            const cartCount = getTotalCartQuantity(query.data.cart.items)
            client.writeData({ data: { cartCount } })
        }
    }, [state.cartId, query.data && JSON.stringify(query.data.cart)])

    /**
     * Handle Update Cart Item Action
     */
    const handleUpdateCartItem = useCallback(
        async (props: { productId: number; quantity: number }) => {
            const { productId, quantity } = props
            const { data } = await updateCartItems({
                variables: {
                    cartId: state.cartId,
                    items: [{ cart_item_id: productId, quantity }],
                },
            })
            return data
        },
        [state.cartId]
    )

    /**
     * Handle Remove Cart Item Action
     */
    const handleRemoveCartItem = useCallback(
        async (props: { productId: number }) => {
            const { productId } = props

            const { data } = await removeCartItem({
                variables: {
                    cartId: state.cartId,
                    itemId: productId,
                },
            })
            return data
        },
        [state.cartId]
    )

    /**
     * Handle Add To Cart
     *  - Simple
     *  - Configurable
     */
    const _addToCart = useCallback(
        async (method: (variables: any) => Promise<any>, variables) => {
            dispatch({ type: 'setAdding', payload: true })

            const { data } = await method({ variables: { cartId: state.cartId, quantity: 1, ...variables } })
                .catch(error => {
                    console.error(error.message)
                })
                .finally(() => {
                    dispatch({ type: 'setAdding', payload: false })
                })
            return data
        },
        [state.cartId]
    )

    const handleAddSimpleProductToCart = useCallback(
        async (props: { sku: string }) => {
            const { sku } = props
            const method = addSimpleProductsToCart
            const { data } = await _addToCart(method, { sku })
            return data
        },
        [state.cartId]
    )

    const handleAddConfigurableProductToCart = useCallback(
        async (props: { sku: string; variantSku: string }) => {
            const { sku, variantSku } = props
            const method = addConfigurableProductsToCart
            const data = await _addToCart(method, { parentSku: sku, sku: variantSku })
            return data
        },
        [state.cartId]
    )

    return {
        query,
        state,
        actions: {
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
            addSimpleProductToCart: handleAddSimpleProductToCart,
            addConfigurableProductToCart: handleAddConfigurableProductToCart,
        },
    }
}
