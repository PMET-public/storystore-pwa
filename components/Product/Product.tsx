import React, { FunctionComponent, useCallback, useState } from 'react'
import { useProduct } from './useProduct'
import { useRouter } from 'next/router'
import { getProductGallery } from '../../lib/getProductGallery'
import DocumentMetadata from '../DocumentMetadata'
import Error from '../Error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../Link'

export type ProductProps = {
    urlKey: string
}

type SelectedOptions = {
    [code: string]: string
}

export const Product: FunctionComponent<ProductProps> = ({ urlKey }) => {
    const { loading, error, addingToCart, data, api, offline } = useProduct({ urlKey })

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
                router.push('/cart')
            } else {
                await api.addSimpleProductToCart({ sku, quantity: 1 })
                router.push('/cart')
            }
        } catch (error) {
            console.error(error)
        }
    }, [data.product && data.product.sku, data.product && data.product.variantSku])

    if (error && offline) return <Error type="Offline" />

    if (error) return <Error type="500" />

    if (loading) return <ViewLoader />

    if (!data || !data.product) return <Error type="404" />

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
    } = product

    return sku ? (
        <React.Fragment>
            <DocumentMetadata title={metaTitle || title} description={metaDescription} keywords={metaKeywords} />
            <ProductTemplate
                onAddToCart={handleAddToCart}
                onChange={handleOnChange}
                title={{
                    text: title,
                }}
                sku={{
                    text: `SKU. ${sku}`,
                }}
                categories={
                    categories && {
                        items: categories
                            .slice(0, 4) // limit to 3
                            .filter((x: any) => !!x.href)
                            .map(({ id, text, href }: any) => ({
                                _id: id,
                                as: Link,
                                urlResolver: true,
                                href: '/' + href,
                                text,
                            })),
                    }
                }
                gallery={getProductGallery(gallery, storeConfig.baseMediaUrl + 'catalog/product')}
                price={{
                    regular: price.regular.amount.value,
                    special: specialPrice,
                    currency: price.regular.amount.currency,
                }}
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
                                            src: image.url,
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
                description={
                    description && {
                        html: description.html,
                    }
                }
            />
        </React.Fragment>
    ) : null
}
