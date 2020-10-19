import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { Root, Downloads, DownloadIcon, DownloadLabel } from './DownloadableProduct.styled'
import Form, { Input, Checkbox, Error } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Link from '~/components/Link'
import Price from '@storystore/ui/dist/components/Price'
import { useProductLayout } from '../../Product'
import { useQuery } from '@apollo/client'
import { DOWNLOADABLE_PRODUCT_QUERY } from '.'
import { DownloadableProducSkeleton } from './DownloadableProduct.skeleton'
export type DownloadableProductProps = {
    urlKey: string
    sku: string
    stock?: 'IN_STOCK' | 'OUT_OF_STOCK'
    price: any
}

export const DownloadableProduct: FunctionComponent<DownloadableProductProps> = ({ sku, price, urlKey, stock = 'IN_STOCK' }) => {
    const { loading, data } = useQuery(DOWNLOADABLE_PRODUCT_QUERY, {
        variables: { filters: { url_key: { eq: urlKey } } },
        fetchPolicy: 'cache-and-network',
    })

    const product = data?.products?.items[0]

    const currency = price.minimum.regular.currency

    const { cartId } = useStoryStore()

    const { addDownloadableProductToCart, addingDownloadableProductToCart } = useCart({ cartId })

    const { setPrice } = useProductLayout()

    const [selectedDownloads, setSelectedDownloads] = useState([...(product?.downloads || [])])

    const [error, setError] = useState<string | null>(null)

    // Set Prices –
    useEffect(() => {
        if (product?.downloads.length > 1) {
            if (selectedDownloads?.length > 0) {
                setPrice({
                    regular: selectedDownloads.reduce((total, { price }) => total + price, 0),
                    currency,
                })
            } else {
                setPrice({
                    label: 'Starting at',
                    regular: Math.min(...[...product.downloads.map((d: any) => d.price)]),
                    currency,
                })
            }
        }
    }, [selectedDownloads, setPrice, product, currency])

    const history = useRouter()

    const inStock = stock === 'IN_STOCK'

    const handleAddToCart = useCallback(
        async ({ sku, quantity, downloads }) => {
            const items = [
                {
                    data: {
                        sku,
                        quantity,
                    },
                    downloadable_product_links: downloads.map((link_id: string) => ({ link_id })),
                },
            ]

            if (!cartId || !inStock || addingDownloadableProductToCart.loading) return

            try {
                setError(null)

                await addDownloadableProductToCart(items)

                await history.push('/cart')

                window.scrollTo(0, 0)
            } catch (e) {
                setError(e.message)
            }
        },
        [addDownloadableProductToCart, inStock, addingDownloadableProductToCart, history, cartId]
    )

    const handleOnValues = useCallback(
        (values: any) => {
            const _selectedDownloads = values.downloads.map((id: string) => product?.downloads.find((download: any) => download.id === Number(id)))
            setSelectedDownloads(_selectedDownloads)
        },
        [product]
    )

    if (loading && !product) return <DownloadableProducSkeleton />

    if (!product) return null

    return (
        <Root as={Form} onValues={handleOnValues} onSubmit={handleAddToCart}>
            <Input name="sku" type="hidden" value={sku} rules={{ required: true }} />

            <Input name="quantity" type="hidden" value={1} rules={{ required: true }} />

            {product.samples?.length > 1 && (
                <Downloads as="ul">
                    <h3>Samples</h3>

                    {product.samples.map((sample: any, key: number) => (
                        <li key={key}>
                            <DownloadIcon />
                            <Link href={sample.url} target="_blank">
                                {sample.title}
                            </Link>
                        </li>
                    ))}
                </Downloads>
            )}

            {/*  Select downloads you will like to add */}
            {product.downloads?.length > 1 ? (
                <Downloads>
                    <Checkbox
                        label={product.linksTitle || 'Downloads'}
                        name="downloads"
                        items={product.downloads.map((download: any) => ({
                            label: (
                                <DownloadLabel>
                                    {download.title}
                                    <span>+</span>
                                    <Price regular={download.price} />

                                    {download.sampleUrl && (
                                        <Link href={download.sampleUrl} target="_blank">
                                            (Preview)
                                        </Link>
                                    )}
                                </DownloadLabel>
                            ),
                            value: download.id.toString(),
                            defaultChecked: true,
                        }))}
                        rules={{ required: true }}
                    />
                </Downloads>
            ) : (
                <React.Fragment>
                    {product.samples.length === 0 && product.downloads[0].sampleUrl && (
                        <Link href={product.downloads[0].sampleUrl} target="_blank">
                            <DownloadIcon /> Sample
                        </Link>
                    )}
                    <Input name="downloads[0]" type="hidden" value={product.downloads[0].id} rules={{ required: true }} />
                </React.Fragment>
            )}

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingDownloadableProductToCart.loading} />

            {error && <Error>{error}</Error>}
        </Root>
    )
}
