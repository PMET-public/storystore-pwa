import { useReducer, Reducer, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'

import CART_QUERY from './queries/cart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './queries/updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './queries/removeCartItem.graphql'
import CREATE_CART_MUTATION from './queries/createCart.graphql'
import ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION from './queries/addSimpleProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './queries/addConfigurableProductsToCart.graphql'

type Money = {
    currency: string
    value: number
}

type Prices = {
    subTotal: Money
    subTotalWithDiscounts: Money
    taxes: Array<{
        label: string
        amount: Money
    }>
    total: Money
}

type ReducerState = {
    id: string
    count: number
    prices: Prices
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
    | {
          type: 'updatePrices'
          payload: Prices
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
        case 'updatePrices':
            return {
                ...state,
                prices: { ...state.prices, ...action.payload },
            }

        default:
            throw `Reducer action not valid.`
    }
}

const initialState: ReducerState = {
    id: '',
    count: 0,
    prices: {
        subTotal: {
            currency: 'USD',
            value: 0,
        },
        subTotalWithDiscounts: {
            currency: 'USD',
            value: 0,
        },
        taxes: [],
        total: {
            currency: 'USD',
            value: 0,
        },
    },
}

export const useCart = (options: { cartId?: string; pageId?: number } = {}) => {
    const { cartId } = options

    const [state, dispatch] = useReducer(reducer, initialState)
    const [createCart] = useMutation(CREATE_CART_MUTATION)
    const [updateCartItems] = useMutation(UPDATE_CART_ITEMS_MUTATION)
    const [removeCartItem] = useMutation(REMOVE_CART_ITEM_MUTATION)
    const [addSimpleProductsToCart] = useMutation(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION)
    const [addConfigurableProductsToCart] = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION)

    const cartQuery = useQuery(CART_QUERY, {
        skip: !cartId,
        fetchPolicy: 'cache-first',
        returnPartialData: true,
        variables: {
            withPage: !!options.pageId,
            pageId: options.pageId,
            cartId: cartId,
        },
    })

    useEffect(() => {
        if (cartId) dispatch({ type: 'setCartId', payload: cartId })
        console.log({ cartId })
    }, [cartId])

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
     * Handle Create Cart Action
     */
    const handleCreateCart = useCallback(async () => {
        const {
            data: { cartId },
        } = await createCart()
        dispatch({ type: 'setCartId', payload: cartId })
        return cartId
    }, [])

    /**
     * Handle Update Cart Item Action
     */
    const handleUpdateCartItem = useCallback(
        async (id: number, quantity: number) => {
            const { data } = await updateCartItems({
                variables: {
                    cartId: state.id,
                    items: [{ cart_item_id: id, quantity }],
                },
            })
            dispatch({ type: 'updatePrices', payload: data.updateCartItems.cart.prices })
            dispatch({ type: 'setCartCount', payload: getTotalCartQuantity(data.updateCartItems.cart.items) })
        },
        [state.id]
    )

    /**
     * Handle Remove Cart Item Action
     */
    const handleRemoveCartItem = useCallback(
        async (id: number) => {
            const { data } = await removeCartItem({
                variables: {
                    cartId: state.id,
                    itemId: id,
                },
            })
            dispatch({ type: 'updatePrices', payload: data.removeItemFromCart.cart.prices })
            dispatch({ type: 'setCartCount', payload: getTotalCartQuantity(data.removeItemFromCart.cart.items) })
        },
        [state.id]
    )

    /**
     * Handle Add To Cart
     *  - Simple
     *  - Configurable
     */
    const _addToCart = useCallback(
        async (method: (variables: any) => Promise<any>, variables) => {
            const quantity = 1

            dispatch({ type: 'setAdding', payload: true })

            method({ variables: { cartId: state.id, quantity, ...variables } })
                .then(({ data }) => {
                    const count = getTotalCartQuantity(data.addToCart.cart.items)
                    const { prices } = data.addToCart.cart
                    dispatch({ type: 'updatePrices', payload: prices })
                    dispatch({ type: 'setCartCount', payload: count })
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
            createCart: handleCreateCart,
            updateCartItem: handleUpdateCartItem,
            removeCartItem: handleRemoveCartItem,
            addSimpleProductToCart: handleAddSimpleProductToCart,
            addConfigurableProductToCart: handleAddConfigurableProductToCart,
        },
    }
}
