import React, { FunctionComponent, useCallback } from 'react'
import { resolveImage } from '../../lib/resolveImage'
import dynamic from 'next/dynamic'
import { Root, SummaryWrapper, CartSummaryWrapper, ProductList, StickyButtonWrapper } from './Cart.styled'

import { useCart } from './useCart'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'
import useNetworkStatus from '../../hooks/useNetworkStatus'

import { useRouter } from 'next/router'
import Link from '~/components/Link'
import Head from '~/components/Head'
import ButtonComponent from '@pmet-public/luma-ui/src/components/Button'
import Breadcrumbs from '@pmet-public/luma-ui/src/components/Breadcrumbs'
import CartList from '@pmet-public/luma-ui/src/components/CartList'
import CartSummary from '@pmet-public/luma-ui/src/components/CartSummary'
import CartLanding from '@pmet-public/luma-ui/src/components/CartLanding'

const Error = dynamic(() => import('../Error'))

type CartProps = {}

export const Cart: FunctionComponent<CartProps> = () => {
    const { cartId } = useStoryStore()

    const history = useRouter()

    const { queries, api } = useCart({ cartId })

    const handleGoToCheckout = useCallback(async () => {
        history.push('/checkout')
    }, [history])

    const online = useNetworkStatus()

    if (!online && !queries.cart.data) return <Error type="Offline" />

    if (!queries.cart.loading && queries.cart.error) return <Error type="500" />

    const { store, cart } = queries.cart.data || {}

    const { items = [], appliedCoupons } = cart || {}

    const productUrlSuffix = store?.productUrlSuffix ?? ''

    if (!queries.cart.loading && !cart?.totalQuantity) {
        return (
            <CartLanding
                title={{ text: 'Shopping Bag' }}
                children={
                    <div>
                        <ButtonComponent as={Link} href="/" style={{ marginTop: '2rem' }}>
                            Get Shopping
                        </ButtonComponent>
                    </div>
                }
            />
        )
    }

    return (
        <React.Fragment>
            <Head title="Shopping Bag" />

            <Root>
                <ProductList>
                    <Breadcrumbs prefix="#" items={[{ text: 'Shopping Bag', as: Link, href: '/cart' }]} />
                    <CartList
                        loading={queries.cart.loading && !cart?.totalQuantity}
                        items={items.map(({ id, quantity, price, product, options }: any, index: number) => ({
                            _id: id || index,
                            title: {
                                as: Link,
                                urlResolver: {
                                    type: 'PRODUCT',
                                    urlKey: product.urlKey,
                                },
                                href: `/${product.urlKey}${productUrlSuffix}`,
                                text: product.name,
                            },
                            sku: `SKU. ${product.sku}`,
                            thumbnail: {
                                as: Link,
                                urlResolver: {
                                    type: 'PRODUCT',
                                    urlKey: product.urlKey,
                                },
                                href: `/${product.urlKey}${productUrlSuffix}`,
                                alt: product.thumbnail.label,
                                src: resolveImage(product.thumbnail.url, { width: 300 }),
                            },
                            quantity: {
                                value: quantity,
                                addLabel: `Add another ${product.name} from shopping bag`,
                                substractLabel: `Remove one ${product.name} from shopping bag`,
                                removeLabel: `Remove all ${product.name} from shopping bag`,
                                onUpdate: (quantity: number) => api.updateCartItem({ cartId, productId: id, quantity }),
                                onRemove: () => api.removeCartItem({ cartId, productId: id }),
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
                        }))}
                    />
                </ProductList>

                <SummaryWrapper>
                    <CartSummaryWrapper>
                        <CartSummary
                            title={{
                                text: 'Bag Summary',
                            }}
                            coupons={{
                                label: 'Apply Coupons',
                                open: !!appliedCoupons,
                                items: [
                                    {
                                        field: {
                                            label: 'Coupon Code',
                                            name: 'couponCode',
                                            error:
                                                api.applyingCoupon.error?.message || api.removingCoupon.error?.message,
                                            disabled: !!appliedCoupons,
                                            defaultValue: appliedCoupons ? appliedCoupons[0].code : undefined,
                                        },
                                        submitButton: {
                                            text: appliedCoupons ? 'Remove' : 'Apply',
                                            type: appliedCoupons ? 'reset' : 'submit',
                                        },
                                        submitting: api.applyingCoupon.loading || api.removingCoupon.loading,
                                        onReset: () => {
                                            api.removeCoupon({ cartId })
                                        },
                                        onSubmit: (values: any) => {
                                            const { couponCode } = values
                                            api.applyCoupon({ cartId, couponCode })
                                        },
                                    },
                                ],
                            }}
                            prices={[
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
                            ]}
                        />
                        <ButtonComponent
                            linkTagAs="button"
                            onClick={handleGoToCheckout}
                            disabled={items.length === 0}
                            text="Checkout"
                            loading={api.updatingCartItem.loading || api.removingCartItem.loading}
                        />
                    </CartSummaryWrapper>
                </SummaryWrapper>

                <StickyButtonWrapper>
                    <ButtonComponent
                        linkTagAs="button"
                        onClick={handleGoToCheckout}
                        disabled={items.length === 0}
                        text="Checkout"
                        loading={api.updatingCartItem.loading || api.removingCartItem.loading}
                    />
                </StickyButtonWrapper>
            </Root>
        </React.Fragment>
    )
}
