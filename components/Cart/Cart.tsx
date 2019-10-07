import React, { FunctionComponent, useCallback, useEffect } from 'react'
import CART_QUERY from './cart.graphql'
import UPDATE_CART_ITEMS_MUTATION from './updateCartItems.graphql'
import REMOVE_CART_ITEM_MUTATION from './removeCartItem.graphql'
import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'

import { useAppContext } from 'luma-ui/dist/AppProvider'
import { useQuery, useMutation } from '@apollo/react-hooks'

import Error from 'next/error'
import DocumentMetadata from '../DocumentMetadata'
import CartTemplate from 'luma-ui/dist/templates/Cart'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type CartProps = {
    pageId?: number
}

export const Cart: FunctionComponent<CartProps> = ({ pageId }) => {
    const [appState, appDispatch] = useAppContext()

    if (!appState.cartId) {
        return null
    }

    const { loading, error, data, refetch } = useQuery(CART_QUERY, {
        fetchPolicy: 'cache-first',
        variables: {
            withPage: !!pageId,
            pageId: pageId,
            cartId: appState.cartId,
        },
    })

    const [updateCartItems, { loading: udpateCartItemsLoading }] = useMutation(UPDATE_CART_ITEMS_MUTATION)

    const [removeCartItem, { loading: removeCartItemLoading }] = useMutation(REMOVE_CART_ITEM_MUTATION)

    const updatesLoading = udpateCartItemsLoading || removeCartItemLoading

    const handleUpdateCartItem = useCallback((id: number, quantity: number) => {
        updateCartItems({
            variables: {
                cartId: appState.cartId,
                items: [{ cart_item_id: id, quantity }],
            },
        }).then(() => refetch())
    }, [])

    const handleRemoveCartItem = useCallback((id: number) => {
        removeCartItem({
            variables: {
                cartId: appState.cartId,
                itemId: id,
            },
        }).then(() => refetch())
    }, [])

    useEffect(() => {
        if (!data) return
        const payload = getTotalCartQuantity(data.cart.items)
        appDispatch({ type: 'setCartCount', payload })
    }, [data && JSON.stringify(data.cart.items)])

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    const { page = {}, store, cart } = data

    return (
        <React.Fragment>
            <DocumentMetadata
                title={[store.titlePrefix, page.title || page.metaTitle || 'Shopping Bag', store.titleSuffix]}
                description={page.metaDescription}
                keywords={page.metaKeywords}
            />
            {cart && cart.items.length > 0 ? (
                <CartTemplate
                    list={{
                        items: cart.items.map(({ id, quantity, product }: any, index: number) => ({
                            _id: id || index,
                            title: {
                                text: product.name,
                            },
                            sku: `SKU. ${product.sku}`,
                            thumbnail: {
                                alt: product.thumbnail.label,
                                src: product.thumbnail.url,
                            },
                            quantity: {
                                value: quantity,
                                addLabel: `Add another ${product.name} from shopping bag`,
                                substractLabel: `Remove one ${product.name} from shopping bag`,
                                removeLabel: `Remove all ${product.name} from shopping bag`,
                                onUpdate: (quantity: number) => handleUpdateCartItem(id, quantity),
                                onRemove: () => handleRemoveCartItem(id),
                            },
                            price: {
                                currency: product.price.regular.amount.currency,
                                regular: product.price.regular.amount.value,
                            },
                            // options: [
                            //     {
                            //         _id: '',
                            //         label: '',
                            //         value: '',
                            //     },
                            // ],
                        })),
                    }}
                    summary={{
                        title: {
                            text: 'Shopping Bag',
                        },
                        prices: [
                            {
                                label: 'Estimated taxes',
                                price: {
                                    currency: cart.prices.taxes[0] && cart.prices.taxes[0].currency,
                                    regular:
                                        cart.prices.taxes.reduce(
                                            (accum: number, tax: { value: number }) => accum + tax.value,
                                            0
                                        ) || null,
                                },
                            },
                            {
                                appearance: 'bold',
                                label: 'Bag subtotal',
                                price: {
                                    currency: cart.prices.subTotal.currency,
                                    regular: cart.prices.subTotal.value,
                                },
                            },
                        ],

                        buttons: [{ text: 'Checkout', loader: updatesLoading ? { label: 'updating ' } : undefined }],
                    }}
                />
            ) : (
                'You cart is empty'
            )}
        </React.Fragment>
    )
}
