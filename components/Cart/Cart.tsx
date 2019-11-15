import React, { FunctionComponent, useCallback, useEffect } from 'react'
import { useCart } from './useCart'
import DocumentMetadata from '../DocumentMetadata'
import Error from '../Error'
import Link from '../Link'
import CartLanding from 'luma-ui/dist/templates/CartLanding'
import Button from 'luma-ui/dist/components/Button'

import CartTemplate from 'luma-ui/dist/templates/Cart'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import { useRouter } from 'next/router'
import { resolveImage } from '../../lib/resolveImage'

type CartProps = {}

export const Cart: FunctionComponent<CartProps> = ({}) => {
    const { loading, updating, removing, error, online, data, api } = useCart()

    const router = useRouter()

    useEffect(() => {
        /** Prefetch Checkout Page */
        router.prefetch('/checkout')
    }, [])

    const handleGoToCheckout = useCallback(async () => {
        router.push('/checkout').then(() => window.scrollTo(0, 0))
    }, [])

    if (!data) return null

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500">{error.message}</Error>

    if (loading) return <ViewLoader />

    const { cart } = data

    return (
        <React.Fragment>
            <DocumentMetadata title="Shopping Bag" />
            {cart && (
                <>
                    {cart.items.length > 0 ? (
                        <CartTemplate
                            breadcrumbs={{
                                prefix: '#',
                                items: [{ text: 'Cart', as: Link, href: '/cart' }],
                            }}
                            list={{
                                items: cart.items.map(({ id, quantity, product, options }: any, index: number) => ({
                                    _id: id || index,
                                    title: {
                                        as: Link,
                                        urlResolver: {
                                            type: 'PRODUCT',
                                            id,
                                        },
                                        href: `/${product.urlKey}`,
                                        text: product.name,
                                    },
                                    sku: `SKU. ${product.sku}`,
                                    thumbnail: {
                                        as: Link,
                                        urlResolver: {
                                            type: 'PRODUCT',
                                            id,
                                        },
                                        href: `/${product.urlKey}`,
                                        alt: product.thumbnail.label,
                                        src: resolveImage(product.thumbnail.url, { width: 250 }),
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
                                    text: 'Bag Summary',
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
                            button={{
                                linkTagAs: 'button',
                                onClick: handleGoToCheckout,
                                disabled: cart.items.length === 0,
                                text: 'Checkout',
                                loading: updating || removing,
                            }}
                        />
                    ) : (
                        <CartLanding
                            title={{
                                text: 'Your bag is empty.',
                            }}
                            children={
                                <div>
                                    <Button as={Link} href="/" style={{ marginTop: '2rem' }}>
                                        Get Shopping
                                    </Button>
                                </div>
                            }
                        />
                    )}
                </>
            )}
        </React.Fragment>
    )
}
