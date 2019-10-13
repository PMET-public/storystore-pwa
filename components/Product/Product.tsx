import React, { FunctionComponent, useCallback, useState } from 'react'
import { useProduct } from './useProduct'
import { getProductGallery } from '../../lib/getProductGallery'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../Link'

export type ProductProps = {
    // TO-DO: Pending
}

type SelectedOptions = {
    [code: string]: number
}

export const Product: FunctionComponent<ProductProps> = ({}) => {
    const { loading, error, addingToCart, data, api } = useProduct({ sku: '24-WB07' })

    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})

    const handleSelectOption = useCallback(
        (selection: { code: string; value: number }) => {
            const { code, value } = selection
            const newSelections = { ...selectedOptions, [code]: value }
            setSelectedOptions(newSelections)
            api.selectVariant(newSelections)
        },
        [JSON.stringify(selectedOptions)]
    )

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!data || !data.product) {
        return <Error statusCode={404} />
    }
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
        variantSku,
        specialPrice,
        stock,
        title,
        type,
    } = product

    return product ? (
        <React.Fragment>
            <DocumentMetadata title={metaTitle || title} description={metaDescription} keywords={metaKeywords} />
            <ProductTemplate
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
                swatches={
                    options &&
                    options
                        .map(({ id, type, label, code, items }: any) => {
                            const selected = false //state.options.selected && state.options.selected[code]

                            return {
                                _id: id,
                                type,
                                title: {
                                    text: selected ? `${label}: missin` : label,
                                },
                                props: {
                                    items: items.map(({ id, label, value, image }: any) => ({
                                        _id: id,
                                        text: label,
                                        image: image && {
                                            alt: image.label,
                                            src: image.url,
                                        },
                                        active: selectedOptions[code] === value,
                                        onClick: () => handleSelectOption({ code, value }),
                                    })),
                                },
                            }
                        })
                        .sort((a: any, b: any) => b.position - a.position)
                }
                buttons={[
                    {
                        as: 'button',
                        text: stock === 'IN_STOCK' ? 'Add to Cart' : 'Sold Out',
                        disabled: !hasCart || stock === 'OUT_OF_STOCK',
                        loader: addingToCart ? { label: 'Loading' } : undefined,
                        onClick: () => {
                            if (type === 'configurable') {
                                api.addConfigurableProductToCart({ sku: sku, variantSku, quantity: 1 })
                            } else {
                                api.addSimpleProductToCart({ sku: sku, quantity: 1 })
                            }
                        },
                    },
                ]}
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
