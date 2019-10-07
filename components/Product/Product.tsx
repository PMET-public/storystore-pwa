import React, { FunctionComponent } from 'react'

import PRODUCT_QUERY from './product.graphql'

import { getProductGallery } from '../../lib/getProductGallery'

import { useQuery } from '@apollo/react-hooks'

import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../Link'
import useProductApi from './useProductApi'

type ProductProps = {
    id: number
}

export const Product: FunctionComponent<ProductProps> = ({ id }) => {
    const { loading, error, data } = useQuery(PRODUCT_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
        returnPartialData: true,
    })

    const [product] = (data && data.products && data.products.items) || []

    const store = (data && data.store) || {}

    const { state, actions } = useProductApi(product)

    // const isAddToCartReady = isInStock && Object.keys(state.options.selected).length === state.options.items.length

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!product) {
        return <Error statusCode={404} />
    }

    return (
        <React.Fragment>
            <DocumentMetadata
                title={[store.titlePrefix, product.metaTitle || product.title, store.titleSuffix]}
                description={product.metaDescription}
                keywords={product.metaKeywords}
            />

            {state.product && (
                <ProductTemplate
                    title={{
                        text: product.title,
                    }}
                    sku={{
                        text: `SKU. ${product.sku}`,
                    }}
                    categories={
                        product.categories && {
                            items: product.categories
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
                    gallery={getProductGallery(state.product.gallery, store.baseMediaUrl + 'catalog/product')}
                    price={{
                        regular: state.product.price.regular.amount.value,
                        special: state.product.specialPrice,
                        currency: state.product.price.regular.amount.currency,
                    }}
                    swatches={
                        state.type === 'configurable'
                            ? state.options.items
                                  .map(({ id, label, code, type, items }: any) => {
                                      const selected = state.options.selected && state.options.selected[code]

                                      return {
                                          _id: id,
                                          type,
                                          title: {
                                              text: selected ? `${label}: ${selected.label}` : label,
                                          },
                                          props: {
                                              items: items.map(({ id, label, value, image }: any) => ({
                                                  _id: id,
                                                  text: label,
                                                  image: image && {
                                                      alt: image.label,
                                                      src: image.url,
                                                  },
                                                  active: selected && value === selected.value,
                                                  onClick: () => actions.handleSelectOption(code, label, value),
                                              })),
                                          },
                                      }
                                  })
                                  .sort((a: any, b: any) => b.position - a.position)
                            : undefined
                    }
                    buttons={[
                        {
                            as: 'button',
                            text: state.product.stock === 'IN_STOCK' ? 'Add to Cart' : 'Sold Out',
                            disabled: state.product.stock !== 'IN_STOCK',
                            loader: state.addToCartLoading ? { label: 'Loading' } : undefined,
                            onClick: () => {
                                debugger
                                if (state.type === 'configurable' && state.variants.selected) {
                                    actions.handleAddConfigurableProductToCart(product.sku, state.variants.selected)
                                } else {
                                    actions.handleAddSimpleProductToCart(product.sku)
                                }
                            },
                        },
                    ]}
                    shortDescription={product.shortDescription && product.shortDescription.html}
                    description={
                        product.description && {
                            html: product.description.html,
                        }
                    }
                />
            )}
        </React.Fragment>
    )
}
