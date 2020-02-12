import React, { FunctionComponent, useCallback } from 'react'
import dynamic from 'next/dynamic'

import { useCart } from './useCart'
import { useRouter } from 'next/router'
import { resolveImage } from '../../lib/resolveImage'

import DocumentMetadata from '../DocumentMetadata'
import Link from '../Link'
import Button from '@pmet-public/luma-ui/dist/components/Button'
import CartTemplate from '@pmet-public/luma-ui/dist/templates/Cart'

const CartLanding = dynamic(() => import('@pmet-public/luma-ui/dist/templates/CartLanding'))
const Error = dynamic(() => import('../Error'))

type CartProps = {}

export const Cart: FunctionComponent<CartProps> = ({}) => {
    const {
        loading,
        updating,
        removing,
        error,
        online,
        data,
        api,
        refetch,
        applyingCoupon,
        removingCoupon,
        couponError,
    } = useCart()

    const router = useRouter()

    const handleGoToCheckout = useCallback(async () => {
        router.push('/checkout').then(() => window.scrollTo(0, 0))
    }, [])

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500" button={{ text: 'Try again', onClick: () => refetch() }} />

    if (!data && !loading) return <Error type="500" />

    const { cart } = data

    const { items = [], appliedCoupons } = cart || {}

    if (cart?.totalQuantity < 1) {
        return (
            <CartLanding
                title={{ text: 'Shopping Bag' }}
                children={
                    <div>
                        <Button as={Link} href="/" style={{ marginTop: '2rem' }}>
                            Get Shopping
                        </Button>
                    </div>
                }
            />
        )
    }

    return (
        <React.Fragment>
            <DocumentMetadata title="Shopping Bag" />
            <CartTemplate
                loading={!process.browser || (loading && !cart)}
                breadcrumbs={{
                    loading: false,
                    prefix: '#',
                    items: [{ text: 'Shopping Bag', as: Link, href: '/cart' }],
                }}
                list={{
                    loading: loading && !cart?.totalQuantity,
                    items: items.map(({ id, quantity, price, product, options }: any, index: number) => ({
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
                            src: resolveImage(product.thumbnail.url),
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
                            currency: price.amount.currency,
                            regular: price.amount.value,
                        },
                        options: options?.map(({ id, label, value }: any) => ({
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
                    coupons: {
                        label: 'Coupons',
                        open: !!appliedCoupons,
                        items: [
                            {
                                field: {
                                    label: 'Coupon Code',
                                    name: 'couponCode',
                                    error: couponError,
                                    disabled: !!appliedCoupons,
                                    defaultValue: appliedCoupons ? appliedCoupons[0].code : undefined,
                                },
                                submitButton: {
                                    text: appliedCoupons ? 'Remove' : 'Apply',
                                    type: appliedCoupons ? 'reset' : 'submit',
                                },
                                submitting: applyingCoupon || removingCoupon,
                                onReset: () => {
                                    api.removeCoupon()
                                },
                                onSubmit: (values: any) => {
                                    const { couponCode } = values
                                    api.applyCoupon({ couponCode })
                                },
                            },
                        ],
                    },
                    prices: [
                        // Sub-total
                        {
                            label: 'Subtotal',
                            price: cart?.prices?.subTotal && {
                                currency: cart.prices.subTotal.currency,
                                regular: cart.prices.subTotal.value,
                            },
                        },

                        // Discounts
                        ...(cart?.prices?.discounts?.map((discount: any) => ({
                            label: discount.label,
                            price: {
                                currency: discount.amount.currency,
                                regular: -discount.amount.value,
                            },
                        })) || []),

                        // Shipping
                        ...(cart?.shippingAddresses
                            ?.filter(({ selectedShippingMethod }: any) => !!selectedShippingMethod)
                            .map(({ selectedShippingMethod }: any) => ({
                                label: `${selectedShippingMethod.carrierTitle} (${selectedShippingMethod.methodTitle})`,
                                price: {
                                    currency: selectedShippingMethod.amount.currency,
                                    regular: selectedShippingMethod.amount.value,
                                },
                            })) || []),

                        // Taxes
                        {
                            label: 'Estimated Taxes',
                            price: cart?.prices?.taxes[0] && {
                                currency: cart.prices.taxes[0] && cart.prices.taxes[0].currency,
                                regular: cart.prices.taxes.reduce(
                                    (accum: number, tax: { value: number }) => accum + tax.value,
                                    0
                                ),
                            },
                        },

                        // Total
                        {
                            appearance: 'bold',
                            label: 'Total',
                            price: cart?.prices?.total && {
                                currency: cart.prices.total.currency,
                                regular: cart.prices.total.value,
                            },
                        },
                    ],
                }}
                button={{
                    linkTagAs: 'button',
                    onClick: handleGoToCheckout,
                    disabled: items.length === 0,
                    text: 'Checkout',
                    loading: updating || removing,
                }}
            />
        </React.Fragment>
    )
}
