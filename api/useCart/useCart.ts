import { useReducer, Reducer, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'

import CART_QUERY from './queries/cart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './queries/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './queries/removeCartItem.graphql'
import CREATE_CART_MUTATION from './queries/createCart.graphql'
import ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION from './queries/addSimpleProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './queries/addConfigurableProductsToCart.graphql'

type ReducerState = {
    id: string
    count: number
    isUpdating?: boolean
    isAdding?: boolean
}

type ReducerActions =
    | {
          type: 'setCartId'
          payload: string
      }
    | {
          type: 'setCartCount'
          payload: number
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
                id: action.payload,
            }
        case 'setCartCount':
            return {
                ...state,
                count: action.payload,
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
    id: (typeof localStorage !== 'undefined' && localStorage.getItem('luma/cart-id')) || '',
    count: 0,
}

export const useCart = (options: { pageId?: number } = {}) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    const [createCart] = useMutation(CREATE_CART_MUTATION)
    const [updateCartItems] = useMutation(UPDATE_CART_ITEMS_MUTATION)
    const [removeCartItem] = useMutation(REMOVE_CART_ITEM_MUTATION)
    const [addSimpleProductsToCart] = useMutation(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION)
    const [addConfigurableProductsToCart] = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION)

    const cartQuery = useQuery(CART_QUERY, {
        skip: !state.id,
        fetchPolicy: 'cache-first',
        returnPartialData: true,
        variables: {
            withPage: !!options.pageId,
            pageId: options.pageId,
            cartId: state.id,
        },
    })

    /**
     * Create New Cart
     */
    useEffect(() => {
        if (!state.id) {
            createCart().then(res => {
                const { cartId = '' } = res.data
                localStorage.setItem('luma/cart-id', cartId)
                dispatch({ type: 'setCartId', payload: cartId })
            })
        }
    }, [])

    /**
     * Update Cart Count State
     */
    useEffect(() => {
        const count =
            cartQuery.data && cartQuery.data.cart && cartQuery.data.cart.items
                ? getTotalCartQuantity(cartQuery.data.cart.items)
                : 0
        dispatch({ type: 'setCartCount', payload: count })
    }, [cartQuery.data && JSON.stringify(cartQuery.data)])

    /**
     * Handle Update Cart Item Action
     */
    const handleUpdateCartItem = useCallback(
        async (id: number, quantity: number) => {
            await updateCartItems({
                variables: {
                    cartId: state.id,
                    items: [{ cart_item_id: id, quantity }],
                },
            })
            cartQuery.refetch()
        },
        [state.id]
    )

    /**
     * Handle Remove Cart Item Action
     */
    const handleRemoveCartItem = useCallback(
        async (id: number) => {
            await removeCartItem({
                variables: {
                    cartId: state.id,
                    itemId: id,
                },
            })
            cartQuery.refetch()
        },
        [state.id]
    )

    /**
     * Handle Add To Cart
     *  - Simple
     *  - Configurable
     */
    const _addToCart = useCallback(
        (method: (variables: any) => Promise<any>, variables) => {
            const quantity = 1

            dispatch({ type: 'setAdding', payload: true })

            method({ variables: { cartId: state.id, quantity, ...variables } })
                .then(() => {
                    cartQuery.refetch()
                })
                .catch(error => {
                    console.error(error.message)
                })
                .finally(() => {
                    dispatch({ type: 'setAdding', payload: false })
                })
        },
        [state.id]
    )

    const handleAddSimpleProductToCart = (sku: string) => {
        const method = addSimpleProductsToCart
        _addToCart(method, { sku })
    }

    const handleAddConfigurableProductToCart = (sku: string, variantSku: string) => {
        const method = addConfigurableProductsToCart
        _addToCart(method, { parentSku: sku, sku: variantSku })
    }

    return {
        query: cartQuery,
        state,
        actions: {
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
            addSimpleProductToCart: handleAddSimpleProductToCart,
            addConfigurableProductToCart: handleAddConfigurableProductToCart,
        },
    }
}
