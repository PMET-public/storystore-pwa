import React, { FunctionComponent, useCallback, useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Root, Wrapper, Steps, Title, CartSummaryWrapper, DoneIcon, PendingIcon } from './Checkout.styled'
import { resolveImage } from '~/lib/resolveImage'
import useNetworkStatus from '~/hooks/useNetworkStatus'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Link from '~/components/Link'
import Head from '~/components/Head'
import CartList from '@storystore/ui/dist/components/CartList'
import CartSummary from '@storystore/ui/dist/components/CartSummary'
import PlaceOrderForm from '@storystore/ui/dist/components/Checkout/PlaceOrderForm'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import { QueryResult } from '@apollo/client'
import { useCart } from '~/hooks/useCart/useCart'
import { ContactInfo } from './ContactInfo'
import { ShippingMethod } from './ShippingMethod'
import { PaymentMethod } from './PaymentMethod'

const Error = dynamic(() => import('~/components/Error'))

export const Checkout: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const contactInfoElem = useRef<HTMLDivElement>(null)
    const shippingMethodElem = useRef<HTMLDivElement>(null)
    const paymentMethodElem = useRef<HTMLDivElement>(null)
    const placeOrderElem = useRef<HTMLDivElement>(null)

    const history = useRouter()

    const { cartId, setCartId } = useStoryStore()

    const api = useCart({ cartId })

    const { cart } = data ?? {}

    /**
     * Redirect to Shopping Cart if empty
     */
    useEffect(() => {
        if (!loading && (!cart || cart.totalQuantity === 0)) history.push('/cart').then(() => window.scrollTo(0, 0))
    }, [loading, cart, history])

    /**
     * Steps
     */
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

    useEffect(() => {
        switch (step) {
            case 1:
                if (!contactInfoElem.current) return
                window.scrollTo({ top: 0, behavior: 'smooth' }) //.scrollIntoView(scrollOptions)
                break
            case 2:
                if (!shippingMethodElem.current) return
                window.scrollTo({
                    top: shippingMethodElem.current.offsetTop - shippingMethodElem.current.offsetHeight,
                    behavior: 'smooth',
                })
                break
            case 3:
                if (!paymentMethodElem.current) return
                window.scrollTo({
                    top: paymentMethodElem.current.offsetTop - paymentMethodElem.current.offsetHeight,
                    behavior: 'smooth',
                })
                break
            case 4:
                if (!placeOrderElem.current) return
                window.scrollTo({
                    top: placeOrderElem.current.offsetTop - placeOrderElem.current.offsetHeight,
                    behavior: 'smooth',
                })
                break
            default:
                break
        }
    }, [step, contactInfoElem, shippingMethodElem, paymentMethodElem, placeOrderElem])

    const handlePlaceOrder = useCallback(async () => {
        const order = await api.placeOrder()

        history.push(`/checkout/confirmation?orderId=${order.id}`).then(() => window.scrollTo(0, 0))

        // Reset Cart by creating a new one
        const cartId = await api.createCart()
        setCartId(cartId)
    }, [api, history, setCartId])

    const online = useNetworkStatus()

    if (!online && !data) return <Error type="Offline" fullScreen />

    return (
        <React.Fragment>
            <Head title="Checkout" />

            <Root>
                <Wrapper>
                    <Breadcrumbs
                        loading={false}
                        prefix="#"
                        items={[
                            { text: 'Shopping Bag', as: Link, href: '/cart' },
                            { text: 'Checkout', as: Link, href: '/checkout' },
                        ]}
                    />

                    <Steps>
                        <div ref={contactInfoElem}>
                            <Title $active>
                                <DoneIcon />
                                <PendingIcon />
                                Contact Information
                            </Title>

                            <ContactInfo edit={step === 1} onEdit={() => setStep(1)} onSave={() => setStep(2)} />
                        </div>

                        <div ref={shippingMethodElem}>
                            <Title $active={step > 1}>
                                <DoneIcon />
                                <PendingIcon />
                                Shipping Method
                            </Title>

                            {step > 1 && <ShippingMethod edit={step === 2} onEdit={() => setStep(2)} onSave={() => setStep(3)} />}
                        </div>

                        <div ref={paymentMethodElem}>
                            <Title $active={step > 2}>
                                <DoneIcon />
                                <PendingIcon />
                                Payment
                            </Title>
                            {step > 2 && <PaymentMethod onSave={() => setStep(4)} />}
                        </div>

                        <div ref={placeOrderElem}>
                            <Title $active={step > 3}>
                                <DoneIcon />
                                <PendingIcon />
                                Finish
                            </Title>
                            {step > 3 && (
                                <PlaceOrderForm
                                    loading={loading}
                                    submitting={api.placingOrder.loading}
                                    error={api.placingOrder.error?.message}
                                    submitButton={{
                                        text: 'Place Order',
                                    }}
                                    onSubmit={handlePlaceOrder}
                                />
                            )}
                        </div>
                    </Steps>
                </Wrapper>

                <CartSummaryWrapper>
                    <CartList
                        loading={loading && !cart?.totalQuantity}
                        items={cart?.items?.map(({ id, quantity, price, product, options }: any, index: number) => ({
                            _id: id || index,
                            title: {
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
                                vignette: false,
                            },
                            quantity: {
                                fixedValue: quantity,
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
                    <CartSummary
                        title={{
                            text: 'Bag Summary',
                        }}
                        coupons={{
                            label: 'Apply Coupons',
                            open: !!cart?.appliedCoupons,
                            items: [
                                {
                                    field: {
                                        label: 'Coupon Code',
                                        name: 'couponCode',
                                        error: api.applyingCoupon.error?.message || api.removingCoupon.error?.message,
                                        disabled: !!cart?.appliedCoupons,
                                        defaultValue: cart?.appliedCoupons ? cart.appliedCoupons[0].code : undefined,
                                    },
                                    submitButton: {
                                        text: cart?.appliedCoupons ? 'Remove' : 'Apply',
                                        type: cart?.appliedCoupons ? 'reset' : 'submit',
                                    },
                                    submitting: api.applyingCoupon.loading || api.removingCoupon.loading,
                                    onReset: () => {
                                        api.removeCoupon()
                                    },
                                    onSubmit: (values: any) => {
                                        const { couponCode } = values
                                        api.applyCoupon({ couponCode })
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
                                    regular: cart.prices.taxes.reduce((accum: number, tax: { value: number }) => accum + tax.value, 0),
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
                </CartSummaryWrapper>
            </Root>
        </React.Fragment>
    )
}
