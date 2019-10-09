import React, { FunctionComponent, useEffect } from 'react'
import useCart from '../../api/useCart'
import { useAppContext } from 'luma-ui/dist/AppProvider'
import Error from 'next/error'
import DocumentMetadata from '../DocumentMetadata'
import CartTemplate from 'luma-ui/dist/templates/Cart'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type CartProps = {
    pageId?: number
}

export const Cart: FunctionComponent<CartProps> = ({ pageId }) => {
    const app = useAppContext()
    const { query, state, actions } = useCart({ cartId: app.state.cartId, pageId })

    /**
     * Sync Count
     */
    useEffect(() => {
        // app.actions.setCartCount(state.count)
    }, [state.count])

    if (query.loading) {
        return <ViewLoader />
    }

    if (query.error) {
        console.error(query.error.message)
        return <Error statusCode={500} />
    }

    if (!query.data) return null

    const { cart, store, page = {} } = query.data

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
                        items: cart.items.map(({ id, quantity, product, options }: any, index: number) => ({
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
                                onUpdate: (quantity: number) => actions.updateCartItem(id, quantity),
                                onRemove: () => actions.removeCartItem(id),
                            },
                            price: {
                                currency: product.price.regular.amount.currency,
                                regular: product.price.regular.amount.value,
                            },
                            options:
                                options &&
                                options.map(({ id, label, value }: any) => ({
                                    _id: id,
                                    label,
                                    value,
                                })),
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
                                    currency: state.prices.subTotal.currency,
                                    regular: state.prices.subTotal.value || null,
                                },
                            },
                        ],

                        buttons: [{ text: 'Checkout', loader: state.isUpdating ? { label: 'updating ' } : undefined }],
                    }}
                />
            ) : (
                'You cart is empty'
            )}
        </React.Fragment>
    )
}
