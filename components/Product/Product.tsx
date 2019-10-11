import React, { FunctionComponent } from 'react'
import { useProduct } from './useProduct'
import { getProductGallery } from '../../lib/getProductGallery'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../Link'

type ProductProps = {
    id: number
}

export const Product: FunctionComponent<ProductProps> = ({ id }) => {
    const { loading, error, data, state, api } = useProduct({ productId: id })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!data) {
        return <Error statusCode={404} />
    }

    const { hasCart, storeConfig, products } = data

    const [product] = (products && products.items) || []

    const { metaTitle, metaDescription, metaKeywords, title, sku, categories } = product

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
                gallery={getProductGallery(state.product.gallery, storeConfig.baseMediaUrl + 'catalog/product')}
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
                                              onClick: () => api.selectOption({ code, label, value }),
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
                        disabled: !hasCart || !state.isAddToCartValid || state.product.stock !== 'IN_STOCK',
                        loader: state.isAddingToCart ? { label: 'Loading' } : undefined,
                        onClick: () => {
                            if (state.type === 'configurable' && state.variants.selected) {
                                api.addConfigurableProductToCart({
                                    sku: sku,
                                    variantSku: state.variants.selected,
                                    quantity: 1,
                                })
                            } else {
                                api.addSimpleProductToCart({ sku: sku, quantity: 1 })
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
            }
        </React.Fragment>
    ) : null
}
