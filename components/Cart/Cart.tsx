import React, { FunctionComponent } from 'react'
import { useCart } from './useCart'
import DocumentMetadata from '../DocumentMetadata'
import Error from '../Error'
import CartTemplate from 'luma-ui/dist/templates/Cart'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import Link from '../Link'

type CartProps = {}

export const Cart: FunctionComponent<CartProps> = ({}) => {
    const { loading, updating, removing, error, online, data, api } = useCart()

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500">{error.message}</Error>

    if (loading) return <ViewLoader />

    if (!data) return null

    const { cart } = data

    return (
        <React.Fragment>
            <DocumentMetadata title="Shopping Bag" />

            {cart && (
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
                                onUpdate: (quantity: number) => api.updateCartItem({ productId: id, quantity }),
                                onRemove: () => api.removeCartItem({ productId: id }),
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
                        prices: cart.prices && [
                            {
                                label: 'Subtotal',
                                price: cart.prices.subTotal && {
                                    currency: cart.prices.subTotal.currency,
                                    regular: cart.prices.subTotal.value,
                                },
                            },
                            {
                                label: 'Estimated Taxes',
                                price: cart.prices.taxes[0] && {
                                    currency: cart.prices.taxes[0] && cart.prices.taxes[0].currency,
                                    regular: cart.prices.taxes.reduce(
                                        (accum: number, tax: { value: number }) => accum + tax.value,
                                        0
                                    ),
                                },
                            },
                            {
                                appearance: 'bold',
                                label: 'Total',
                                price: cart.prices.total && {
                                    currency: cart.prices.total.currency,
                                    regular: cart.prices.total.value,
                                },
                            },
                        ],
                    }}
                    buttons={[
                        {
                            as: Link,
                            linkTagAs: 'button',
                            href: '/checkout',
                            disabled: cart.items.length === 0,
                            text: 'Checkout',
                            loading: updating || removing,
                        },
                    ]}
                />
            )}
        </React.Fragment>
    )
}
