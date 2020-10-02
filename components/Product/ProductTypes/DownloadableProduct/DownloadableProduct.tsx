import React, {
    FunctionComponent,
    useCallback,
    // useContext
} from 'react'
import { Root, Downloads, DownloadIcon, DownloadLabel } from './DownloadableProduct.styled'
import Form, { Input, Checkbox } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'
import Link from '~/components/Link'
import Price from '@storystore/ui/dist/components/Price'
// import { ProductContext } from '../../Product'

export type DownloadableProductProps = {
    sku: string
    downloads?: Array<{ id: number; order: number; title: string; price: number }>
    samples?: Array<{ order: number; title: string; url: string }>
    stock?: 'IN_STOCK' | 'OUT_OF_STOCK'
}

export const DownloadableProduct: FunctionComponent<DownloadableProductProps> = ({ sku, downloads = [], samples, stock = 'IN_STOCK' }) => {
    const { cartId } = useStoryStore()

    const { addDownloadableProductToCart, addingDownloadableProductToCart } = useCart({ cartId })

    // const { setPrice } = useContext(ProductContext)

    // const handleValues = useCallback(
    //     (values: any) => {
    //         if (downloads) {
    //             if (values?.downloads?.length > 0) {
    //                 setPrice({
    //                     regular: values.downloads.reduce((total: number, _downloadId: string) => {
    //                         const downloadId = Number(_downloadId)
    //                         const price = downloads.find(x => x.id === downloadId)?.price || 0
    //                         return total + price
    //                     }, 0),
    //                 })
    //             } else {
    //                 setPrice({
    //                     label: 'Starting at',
    //                     regular: Math.min(...[...downloads.map(d => d.price)]),
    //                 })
    //             }
    //         }
    //     },
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     [downloads]
    // )

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

    return (
        <Root
            as={Form}
            //  onValues={handleValues}
            onSubmit={handleAddToCart}
        >
            <Input name="sku" type="hidden" value={sku} rules={{ required: true }} />

            <Input name="quantity" type="hidden" value={1} rules={{ required: true }} />

            {samples && (
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
                        label="Downloads"
                        name="downloads"
                        items={downloads.map(download => ({
                            label: (
                                <DownloadLabel>
                                    {download.title}
                                    <span>+</span>
                                    <Price regular={download.price} />
                                </DownloadLabel>
                            ),
                            value: download.id.toString(),
                            defaultChecked: true,
                        }))}
                        rules={{ required: true }}
                    />
                </Downloads>
            ) : (
                <Input name="downloads[0]" type="hidden" value={downloads[0].id} rules={{ required: true }} />
            )}

            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingDownloadableProductToCart.loading} />
        </Root>
    )
}
