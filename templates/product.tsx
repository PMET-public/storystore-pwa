import React, { FunctionComponent, useReducer, Reducer, useCallback, useEffect } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'

import DocumentMetadata from '../components/DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../components/Link'
import { ImageProps } from 'luma-ui/dist/components/Image'

type ProductProps = {
    id: number
}

const PRODUCT_QUERY = gql`
    query ProductQuery {
        products(filter: { sku: { eq: "WH12" } }, pageSize: 1) {
            items {
                id
                title: name
                categories {
                    id
                    text: name
                    href: url_path
                }
                sku
                price {
                    regularPrice {
                        amount {
                            currency
                            value
                        }
                    }
                }

                ... on ConfigurableProduct {
                    options: configurable_options {
                        id
                        label
                        position
                        code: attribute_code
                        items: values {
                            id: value_index
                            label
                            value: value_index
                        }
                    }
                    variants {
                        attributes {
                            code
                            value: value_index
                        }
                        product {
                            id
                            gallery: media_gallery_entries {
                                id
                                file
                                label
                                disabled
                                type: media_type
                            }
                            sku
                            stock: stock_status
                        }
                    }
                }

                gallery: media_gallery_entries {
                    id
                    file
                    label
                    disabled
                    type: media_type
                }

                shortDescription: short_description {
                    html
                }

                description: description {
                    html
                }

                metaDescription: meta_description
                metaKeywords: meta_keyword
                metaTitle: meta_title
            }
        }
        store: storeConfig {
            id
            titlePrefix: title_prefix
            titleSuffix: title_suffix
            baseMediaUrl: base_media_url
        }
    }
`

type ProductGallery = Array<{
    id: number
    file: string
    label: string
    disabled?: boolean
    type: 'image'
}>

type Options = {
    [code: string]: number
}

type Variants = Array<
    { [code: string]: number } & {
        gallery: ProductGallery
    }
>

type Product = {
    gallery: ImageProps[]
}

type ReducerState = {
    options: Options
    variants: Variants
    product: Product
}

type ReducerActions =
    | {
          type: 'setOptions'
          payload: Options
      }
    | {
          type: 'setVariants'
          payload: Variants
      }
    | {
          type: 'setProduct'
          payload: Product
      }

const initialState: ReducerState = {
    options: {},
    variants: [],
    product: {
        gallery: [],
    },
}

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'setOptions':
            return {
                ...state,
                options: {
                    ...state.options,
                    ...action.payload,
                },
            }
        case 'setVariants':
            return {
                ...state,
                variants: [...state.variants, ...action.payload],
            }
        case 'setProduct':
            return {
                ...state,
                product: { ...state.product, ...action.payload },
            }
        default:
            throw `Reducer action not valid.`
    }
}

const Product: FunctionComponent<ProductProps> = ({ id }) => {
    const { loading, error, data } = useQuery(PRODUCT_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
    })

    const [product] = (data && data.products.items) || []

    const store = (data && data.store) || {}

    const [state, dispatch] = useReducer(reducer, initialState)

    const getProductGallery = useCallback(
        (gallery: ProductGallery) => {
            return gallery
                .filter((x: any) => x.disabled === false && x.type === 'image')
                .map(({ id, label, file }: any) => ({
                    _id: id,
                    alt: label,
                    src: store.baseMediaUrl + 'catalog/product' + file,
                }))
                .sort((a: any, b: any) => a.position - b.position)
        },
        [store.baseMediaUrl]
    )

    useEffect(() => {
        const payload = product.variants.reduce((accumVariants: [], currentVariant: any) => {
            return [
                ...accumVariants,
                currentVariant.attributes.reduce((accumAttributes: {}, currentAttribute: any) => {
                    const { code, value } = currentAttribute
                    return { ...accumAttributes, [code]: value, product: currentVariant.product }
                }, {}),
            ]
        }, [])

        dispatch({ type: 'setVariants', payload })
    }, [product && product.id])

    useEffect(() => {
        const options = Object.keys(state.options)

        const defaultVariant = { product }

        const variant =
            options.length > 0
                ? state.variants.find(v => {
                      return options.reduce((accum: boolean, x) => v[x] === state.options[x] && accum, true)
                  }) || defaultVariant
                : defaultVariant

        dispatch({
            type: 'setProduct',
            payload: {
                gallery: getProductGallery(variant.product.gallery),
            },
        })
    }, [product && product.id, JSON.stringify(state.options)])

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
                gallery={state.product.gallery}
                price={{
                    regular: product.price.regularPrice.amount.value,
                    currency: product.price.regularPrice.amount.currency,
                }}
                swatches={
                    product.options &&
                    product.options
                        .sort((a: any, b: any) => b.position - a.position)
                        .map(({ id, label, code, items }: any) => ({
                            _id: id,
                            type: 'text',
                            title: {
                                text: label,
                            },
                            props: {
                                items: items.map(({ id, label, value }: any) => ({
                                    _id: id,
                                    text: label,
                                    active: value === state.options[code],
                                    onClick: () =>
                                        dispatch({
                                            type: 'setOptions',
                                            payload: { [code]: value },
                                        }),
                                })),
                            },
                        }))
                }
                buttons={[{ as: 'button', text: 'Add to Cart', disabled: true }]}
                shortDescription={product.shortDescription && product.shortDescription.html}
                description={
                    product.description && {
                        html: product.description.html,
                    }
                }
            />
        </React.Fragment>
    )
}

export default Product
