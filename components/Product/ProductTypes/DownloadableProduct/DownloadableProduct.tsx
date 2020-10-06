import React, { FunctionComponent, useCallback, useEffect, useState } from 'react'
import { Root, Downloads, DownloadIcon, DownloadLabel } from './DownloadableProduct.styled'
import Form, { Input, Checkbox } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Link from '~/components/Link'
import Price from '@storystore/ui/dist/components/Price'
import { useProductLayout } from '../../Product'

export type DownloadableProductProps = {
    sku: string
    downloads?: Array<{ id: number; order: number; title: string; price: number; sampleUrl?: string }>
    samples?: Array<{ order: number; title: string; url: string }>
    stock?: 'IN_STOCK' | 'OUT_OF_STOCK'
    price: any
    linksTitle?: string
}

export const DownloadableProduct: FunctionComponent<DownloadableProductProps> = ({ linksTitle = 'Downloads', price, sku, downloads = [], samples = [], stock = 'IN_STOCK' }) => {
    const { cartId } = useStoryStore()

    const { addDownloadableProductToCart, addingDownloadableProductToCart } = useCart({ cartId })

    const { setPrice } = useProductLayout()

    const [selectedDownloads, setSelectedDownloads] = useState([...downloads])

    // Set Prices –
    useEffect(() => {
        if (downloads.length > 1) {
            const currency = price?.minimum.regular.currency

            if (selectedDownloads?.length > 0) {
                setPrice({
                    regular: selectedDownloads.reduce((total, { price }) => total + price, 0),
                    currency,
                })
            } else {
                setPrice({
                    label: 'Starting at',
                    regular: Math.min(...[...downloads.map(d => d.price)]),
                    currency,
                })
            }
        }
    }, [selectedDownloads, downloads, price?.minimum.regular.currency, setPrice])

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

            await addDownloadableProductToCart(items)

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [addDownloadableProductToCart, inStock, addingDownloadableProductToCart, history, cartId]
    )

    const handleOnValues = useCallback(
        (values: any) => {
            const _selectedDownloads = values.downloads.map((id: string) => downloads.find((download: any) => download.id === Number(id)))
            setSelectedDownloads(_selectedDownloads)
        },
        [downloads]
    )

    return (
        <Root as={Form} onValues={handleOnValues} onSubmit={handleAddToCart}>
            <Input name="sku" type="hidden" value={sku} rules={{ required: true }} />

            <Input name="quantity" type="hidden" value={1} rules={{ required: true }} />

            {samples.length > 1 && (
                <Downloads as="ul">
                    <h3>Samples</h3>

                    {samples.map((sample, key) => (
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
            {downloads.length > 1 ? (
                <Downloads>
                    <Checkbox
                        label={linksTitle}
                        name="downloads"
                        items={downloads.map(download => ({
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
                    {samples.length === 0 && downloads[0].sampleUrl && (
                        <Link href={downloads[0].sampleUrl} target="_blank">
                            <DownloadIcon /> Sample
                        </Link>
                    )}
                    <Input name="downloads[0]" type="hidden" value={downloads[0].id} rules={{ required: true }} />
                </React.Fragment>
            )}

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingDownloadableProductToCart.loading} />
        </Root>
    )
}
