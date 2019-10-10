import React, { FunctionComponent } from 'react'
import useProduct from '../../api/useProduct'
import useCart from '../../api/useCart'
import { getProductGallery } from '../../lib/getProductGallery'
// import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../Link'

type ProductProps = {
    id: number
}

export const Product: FunctionComponent<ProductProps> = ({ id }) => {
    const { query, state, actions } = useProduct({ productId: id })
    const cart = useCart()

    const { data } = query

    if (query.loading) {
        return <ViewLoader />
    }

    if (query.error) {
        console.error(query.error.message)
        return <Error statusCode={500} />
    }

    const [product] = (data.products && data.products.items) || []

    const { store } = data

    return product ? (
        <React.Fragment>
            <DocumentMetadata
                title={[store.titlePrefix, product.metaTitle || product.title, store.titleSuffix]}
                description={product.metaDescription}
                keywords={product.metaKeywords}
            />
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
                                              onClick: () => actions.selectOption({ code, label, value }),
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
                        disabled: state.isAddToCartValid === false || state.product.stock !== 'IN_STOCK',
                        loader: cart.state.isAdding ? { label: 'Loading' } : undefined,
                        onClick: async () => {
                            if (state.type === 'configurable' && state.variants.selected) {
                                cart.actions.addConfigurableProductToCart({
                                    sku: product.sku,
                                    variantSku: state.variants.selected,
                                })
                            } else {
                                cart.actions.addSimpleProductToCart({ sku: product.sku })
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
