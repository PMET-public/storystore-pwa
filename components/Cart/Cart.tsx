import React, { FunctionComponent, useCallback } from 'react'
import { resolveImage } from '~/lib/resolveImage'
import dynamic from 'next/dynamic'
import { Root, SummaryWrapper, CartSummaryWrapper, ProductList, StickyButtonWrapper } from './Cart.styled'
import useNetworkStatus from '~/hooks/useNetworkStatus'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Link from '~/components/Link'
import Head from '~/components/Head'
import ButtonComponent from '@storystore/ui/dist/components/Button'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import CartList from '@storystore/ui/dist/components/CartList'
import CartSummary from '@storystore/ui/dist/components/CartSummary'
import EmptyCart from '@storystore/ui/dist/components/EmptyCart'
import ViewLoader from '@storystore/ui/dist/components/ViewLoader'
import { QueryResult } from '@apollo/client'
import { useCart } from '~/hooks/useCart/useCart'

const Error = dynamic(() => import('../Error'))

export const Cart: FunctionComponent<QueryResult> = ({ loading, error, data }) => {
    const { cartId } = useStoryStore()

    const history = useRouter()

    const { updateCartItem, updatingCartItem, removeCartItem, removingCartItem, applyCoupon, applyingCoupon, removeCoupon, removingCoupon } = useCart({ cartId })

    const handleGoToCheckout = useCallback(async () => {
        await history.push('/checkout')
        window.scrollTo(0, 0)
    }, [history])

    const online = useNetworkStatus()

    if (!online && !data) return <Error type="Offline" fullScreen />

    if (!loading && error) return <Error type="500" />

    const { items = [], appliedCoupons, totalQuantity, prices, shippingAddresses } = data?.cart || {}

    const productUrlSuffix = data?.store?.productUrlSuffix ?? ''

    if (loading && !data) return <ViewLoader />

    if ((!loading && totalQuantity < 1) || !data) {
        return (
            <React.Fragment>
                <Head title="Shopping Bag" />
                <EmptyCart title={{ text: 'Shopping Bag' }}>
                    <ButtonComponent as={Link} href="/" style={{ marginTop: '2rem' }}>
                        Get shopping
                    </ButtonComponent>
                </EmptyCart>
            </React.Fragment>
        )
    }

    return (
        <React.Fragment>
            <Head title={`Shopping Bag ${totalQuantity ? `(${totalQuantity})` : ''}`} />

            <Root>
                <ProductList>
                    <Breadcrumbs prefix="#" items={[{ text: 'Shopping Bag', as: Link, href: '/cart' }]} />
                    <CartList
                        loading={loading && !totalQuantity}
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
                                alt: product.thumbnail.label,
                                src: resolveImage(product.thumbnail.url, { width: 300, height: 300 }),
                                width: 300,
                                height: 300,
                                sources: [
                                    <source key="webp" type="image/webp" srcSet={resolveImage(product.thumbnail.url, { width: 300, height: 300, type: 'webp' })} />,
                                    <source key="original" srcSet={resolveImage(product.thumbnail.url, { width: 300, height: 300 })} />,
                                ],
                            },
                            quantity: {
                                value: quantity,
                                addLabel: `Add another ${product.name} from shopping bag`,
                                substractLabel: `Remove one ${product.name} from shopping bag`,
                                removeLabel: `Remove all ${product.name} from shopping bag`,
                                onUpdate: (quantity: number) => updateCartItem({ productId: id, quantity }),
                                onRemove: () => removeCartItem({ productId: id }),
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
                                            error: applyingCoupon.error?.message || removingCoupon.error?.message,
                                            disabled: !!appliedCoupons,
                                            defaultValue: appliedCoupons ? appliedCoupons[0]?.code : undefined,
                                        },
                                        submitButton: {
                                            text: appliedCoupons ? 'Remove' : 'Apply',
                                            type: appliedCoupons ? 'reset' : 'submit',
                                        },
                                        submitting: applyingCoupon.loading || removingCoupon.loading,
                                        onReset: () => {
                                            removeCoupon()
                                        },
                                        onSubmit: (values: any) => {
                                            const { couponCode } = values
                                            applyCoupon({ couponCode })
                                        },
                                    },
                                ],
                            }}
                            prices={[
                                // Sub-total
                                {
                                    label: 'Subtotal',
                                    price: prices?.subTotal && {
                                        currency: prices.subTotal.currency,
                                        regular: prices.subTotal.value,
                                    },
                                },

                                // Discounts
                                ...(prices?.discounts?.map((discount: any) => ({
                                    label: discount.label,
                                    price: {
                                        currency: discount.amount.currency,
                                        regular: -discount.amount.value,
                                    },
                                })) || []),

                                // Shipping
                                ...(shippingAddresses
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
                                    price: prices?.taxes[0] && {
                                        currency: prices.taxes[0] && prices.taxes[0].currency,
                                        regular: prices.taxes.reduce((accum: number, tax: { value: number }) => accum + tax.value, 0),
                                    },
                                },

                                // Total
                                {
                                    appearance: 'bold',
                                    label: 'Total',
                                    price: prices?.total && {
                                        currency: prices.total.currency,
                                        regular: prices.total.value,
                                    },
                                },
                            ]}
                        />
                        <ButtonComponent linkTagAs="button" onClick={handleGoToCheckout} disabled={items.length === 0} text="Checkout" loading={updatingCartItem.loading || removingCartItem.loading} />
                    </CartSummaryWrapper>
                </SummaryWrapper>

                <StickyButtonWrapper>
                    <ButtonComponent linkTagAs="button" onClick={handleGoToCheckout} disabled={items.length === 0} text="Checkout" loading={updatingCartItem.loading || removingCartItem.loading} />
                </StickyButtonWrapper>
            </Root>
        </React.Fragment>
    )
}
