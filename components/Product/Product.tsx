import React, { FunctionComponent, useReducer, Reducer, useCallback, useEffect } from 'react'
import PRODUCT_QUERY from './productQuery.graphql'

import { useQuery } from '@apollo/react-hooks'

import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import ProductTemplate from 'luma-ui/dist/templates/Product'
import Link from '../Link'
import { ImageProps } from 'luma-ui/dist/components/Image'

type ProductProps = {
    id: number
}

type ProductGallery = Array<{
    id: number
    file: string
    label: string
    disabled?: boolean
    type: 'image'
}>

type Option = {
    id: number
    label: string
    code: string
    type: 'text' | 'thumb'
    items: Array<{
        id: number
        label: string
        value: number
        thumbnail?: {
            label: string
            url: string
        }
        disabled: boolean
    }>
}

type OptionsSelected = {
    [code: string]: {
        label: string
        value: number
    }
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
    options: {
        items: Array<Option>
        selected: OptionsSelected
    }
    variants: {
        items: Variants
        selected: Product
    }
}

type ReducerActions =
    | {
          type: 'setOptions'
          payload: Array<Option>
      }
    | {
          type: 'selectOption'
          payload: OptionsSelected
      }
    | {
          type: 'setVariants'
          payload: Variants
      }
    | {
          type: 'selectVariant'
          payload: Product
      }

const initialState: ReducerState = {
    options: {
        items: [],
        selected: {},
    },
    variants: {
        items: [],
        selected: {
            gallery: [],
        },
    },
}

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'setOptions':
            return {
                ...state,
                options: {
                    ...state.options,
                    items: [...state.options.items, ...action.payload],
                },
            }
        case 'selectOption':
            return {
                ...state,
                options: {
                    ...state.options,
                    selected: {
                        ...state.options.selected,
                        ...action.payload,
                    },
                },
            }
        case 'setVariants':
            return {
                ...state,
                variants: {
                    ...state.variants,
                    items: [...state.variants.items, ...action.payload],
                },
            }
        case 'selectVariant':
            return {
                ...state,
                variants: {
                    ...state.variants,
                    selected: action.payload,
                },
            }
        default:
            throw `Reducer action not valid.`
    }
}

export const Product: FunctionComponent<ProductProps> = ({ id }) => {
    const { loading, error, data } = useQuery(PRODUCT_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
        returnPartialData: true,
    })

    const [product] = (data && data.products && data.products.items) || []

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

    /**
     * Set Options for Configurable Products
     */
    useEffect(() => {
        if (!product || !product.options || !product.variants) return

        const variants = product.variants.reduce((accumVariants: [], currentVariant: any) => {
            return [
                ...accumVariants,
                currentVariant.attributes.reduce((accumAttributes: {}, currentAttribute: any) => {
                    const { code, value } = currentAttribute
                    return { ...accumAttributes, [code]: value, product: currentVariant.product }
                }, {}),
            ]
        }, [])

        const options = product.options
            .sort((a: any, b: any) => b.position - a.position)
            .map((option: any) => {
                const { id, label, code, items } = option
                const type = code === 'color' ? 'thumb' : 'text'

                return {
                    id,
                    type,
                    label,
                    code,
                    items: items.map((item: any) => {
                        const disabled = item.stock !== 'IN_STOCK'

                        const { id, value, label } = item

                        const { product } = variants.find((x: any) => x.color === value) || {}

                        return {
                            id,
                            value,
                            label,
                            disabled,
                            image: product && product.thumbnail,
                        }
                    }),
                }
            })

        dispatch({ type: 'setVariants', payload: variants })
        dispatch({ type: 'setOptions', payload: options })
    }, [product && product.id])

    /**
     * Set Product Details if an option is selected
     */
    useEffect(() => {
        if (!product) return

        const options = Object.keys(state.options.selected)

        const defaultVariant = { product }

        const variant =
            options.length > 0
                ? state.variants.items.find(v => {
                      return options.reduce(
                          (accum: boolean, x) => v[x] === state.options.selected[x].value && accum,
                          true
                      )
                  }) || defaultVariant
                : defaultVariant

        dispatch({
            type: 'selectVariant',
            payload: {
                ...variant.product,
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
                gallery={state.variants.selected.gallery}
                price={{
                    regular: product.price.regularPrice.amount.value,
                    currency: product.price.regularPrice.amount.currency,
                }}
                swatches={state.options.items
                    .map(({ id, label, code, type, items }: any) => {
                        const selected = state.options.selected[code]

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
                                    onClick: () =>
                                        dispatch({
                                            type: 'selectOption',
                                            payload: { [code]: { label, value } },
                                        }),
                                })),
                            },
                        }
                    })
                    .sort((a: any, b: any) => b.position - a.position)}
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
