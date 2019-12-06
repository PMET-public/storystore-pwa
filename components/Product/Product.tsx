import React, { FunctionComponent, useCallback, useState } from 'react'
import { useProduct } from './useProduct'
import { useRouter } from 'next/router'
import DocumentMetadata from '../DocumentMetadata'
import Error from '../Error'
import ProductTemplate from '@pmet-public/luma-ui/dist/templates/Product'
import Link from '../Link'
import { resolveImage } from '../../lib/resolveImage'

export type ProductProps = {
    urlKey: string
}

type SelectedOptions = {
    [code: string]: string
}

export const Product: FunctionComponent<ProductProps> = ({ urlKey }) => {
    const { loading, error, addingToCart, data, api, online, refetch } = useProduct({ urlKey })

    const router = useRouter()

    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})

    const handleOnChange = useCallback(
        (values: { options: { [key: string]: string } }) => {
            const options = Object.entries(values.options).reduce((accum, option) => {
                return option[1]
                    ? {
                          ...accum,
                          [option[0]]: option[1],
                      }
                    : { ...accum }
            }, {})

            setSelectedOptions(options)

            api.selectVariant(options)
        },
        [api.selectVariant]
    )

    const handleAddToCart = useCallback(async () => {
        const { sku, variantSku } = data.product
        try {
            if (type === 'configurable') {
                await api.addConfigurableProductToCart({ sku, variantSku, quantity: 1 })
            } else if (type === 'simple') {
                await api.addSimpleProductToCart({ sku, quantity: 1 })
            }
            await router.push('/cart').then(() => window.scrollTo(0, 0))
        } catch (error) {
            console.error(error)
        }
    }, [data.product && data.product.sku, data.product && data.product.variantSku])

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500" button={{ text: 'Try again', onClick: refetch }} />

    if (!loading && (!data || !data.product))
        return (
            <Error
                type="404"
                children="We're sorry, we coudn't find the product."
                button={{ text: 'Search', as: Link, href: '/search' }}
            />
        )

    const { storeConfig, hasCart, product } = data

    const {
        categories,
        description,
        gallery,
        metaDescription,
        metaKeywords,
        metaTitle,
        options,
        price,
        shortDescription,
        sku,
        specialPrice,
        stock,
        title,
        type,
    } = product || {}

    if (type && type !== 'configurable' && type !== 'simple') {
        return <Error type="500">Product type: {type} not supported.</Error>
    }

    return (
        <React.Fragment>
            <DocumentMetadata title={metaTitle || title} description={metaDescription} keywords={metaKeywords} />
            <ProductTemplate
                onAddToCart={handleAddToCart}
                onChange={handleOnChange}
                title={{
                    text: title,
                }}
                sku={
                    sku && {
                        text: `SKU. ${sku}`,
                    }
                }
                categories={
                    categories && {
                        items: categories
                            .slice(0, 4) // limit to 3
                            .filter((x: any) => !!x.href)
                            .map(({ id, text, href }: any) => ({
                                _id: id,
                                as: Link,
                                urlResolver: {
                                    type: 'CATEGORY',
                                    id,
                                },
                                href: '/' + href,
                                text,
                            })),
                    }
                }
                gallery={
                    gallery &&
                    gallery
                        .filter((x: any) => x.disabled === false && x.type === 'image')
                        .map(({ id, label, file }: any) => ({
                            _id: id,
                            alt: label,
                            src: {
                                desktop: resolveImage(storeConfig.baseMediaUrl + '/catalog/product' + file, {
                                    width: 1200,
                                }),
                                mobile: resolveImage(storeConfig.baseMediaUrl + '/catalog/product' + file, {
                                    width: 600,
                                }),
                            },
                        }))
                        .sort((a: any, b: any) => a.position - b.position)
                }
                price={
                    price && {
                        regular: price.regular.amount.value,
                        special: specialPrice,
                        currency: price.regular.amount.currency,
                    }
                }
                options={
                    options &&
                    options
                        .map(({ id, type, label, required = true, code, items }: any) => {
                            const selected = items.find((x: any) => {
                                return code === x.code, x.value.toString() === selectedOptions[code]
                            })

                            return {
                                _id: id,
                                type,
                                required,
                                label: selected ? `${label}: ${selected.label}` : label,
                                swatches: {
                                    name: `options.${code}`,
                                    items: items.map(({ id, label, value, image }: any) => ({
                                        _id: id,
                                        text: label,
                                        type: 'radio',
                                        value,
                                        image: image && {
                                            alt: image.label,
                                            src: resolveImage(image.url, { width: 240 }),
                                        },
                                    })),
                                },
                            }
                        })
                        .sort((a: any, b: any) => b.position - a.position)
                }
                addToCartButton={{
                    as: 'button',
                    text: stock === 'IN_STOCK' ? 'Add to Cart' : 'Sold Out',
                    disabled: !hasCart || stock === 'OUT_OF_STOCK',
                    loading: addingToCart,
                }}
                shortDescription={shortDescription && shortDescription.html}
                description={description && description.html}
            />
        </React.Fragment>
    )
}
