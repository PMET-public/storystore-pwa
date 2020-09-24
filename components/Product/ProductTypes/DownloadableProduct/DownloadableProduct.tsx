import React, { FunctionComponent, useCallback } from 'react'
import { Downloads, DownloadIcon } from './DownloadableProduct.styled'
import Form, { Input } from '@storystore/ui/dist/components/Form'
import Button from '@storystore/ui/dist/components/Button'
import { useCart } from '~/hooks/useCart/useCart'
import { useStoryStore } from '~/lib/storystore'
import { useRouter } from 'next/router'

export type DownloadableProductProps = {
    sku: string
    inStock?: boolean
    downloads?: Array<{ id: string; order: number; title: string }>
}

export const DownloadableProduct: FunctionComponent<DownloadableProductProps> = ({ sku, downloads, inStock = true }) => {
    const { cartId } = useStoryStore()

    const { addDownloadableProductToCart, addingDownloadableProductToCart } = useCart({ cartId })

    const history = useRouter()

    const handleAddToCart = useCallback(
        async ({ items }) => {
            if (!cartId || !inStock || addingDownloadableProductToCart.loading) return

            await addDownloadableProductToCart(items)

            await history.push('/cart')

            window.scrollTo(0, 0)
        },
        [addDownloadableProductToCart, inStock, addingDownloadableProductToCart, history, cartId]
    )

    return (
        <Form onSubmit={handleAddToCart}>
            <Input name="items[0].data.sku" type="hidden" value={sku} rules={{ required: true }} />

            <Input name="items[0].data.quantity" type="hidden" value={1} rules={{ required: true }} />

            {downloads && (
                <Downloads as="ul">
                    <h3>Downloads Included:</h3>
                    {downloads.map((download, key) => (
                        <li key={key}>
                            <Input name={`items[0].downloadable_product_links[${key}].link_id`} type="hidden" value={download.id} rules={{ required: true }} />
                            <DownloadIcon /> {download.title}
                        </li>
                    ))}
                </Downloads>
            )}
            <Button type="submit" as="button" text={inStock ? 'Add to Cart' : 'Sold Out'} disabled={!inStock} loading={addingDownloadableProductToCart.loading} />
        </Form>
    )
}
