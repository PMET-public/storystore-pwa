import { useCallback, useState, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { queryDefaultOptions } from '../../lib/apollo/client'

import PRODUCT_QUERY from './graphql/product.graphql'
import ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION from './graphql/addSimpleProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './graphql/addConfigurableProductsToCart.graphql'

type ProductVariant =
    | {
          variantSku?: string
          price: {
              regular: {
                  amount: {
                      currency: string
                      value: number
                  }
              }
          }
          specialPrice: number
          stock: string
          gallery: Array<{
              id: number
              file: string
              label: string
              type: string
          }>
      }
    | undefined

type OptionsAndVariants =
    | {
          options: any[]
          variants: any[]
      }
    | undefined

type UseProduct = {
    urlKey: string
}
export const useProduct = ({ urlKey }: UseProduct) => {
    const product = useQuery(PRODUCT_QUERY, {
        ...queryDefaultOptions,
        variables: { urlKey },
    })

    const [productVariant, setProductVariant] = useState<ProductVariant>()

    const _product = product.data?.product?.items[0]

    /**
     * Fix Options Data
     */
    const optionsAndVariants: OptionsAndVariants = useMemo(() => {
        if (!_product) return

        const variants = _product.variants?.reduce(
            (accumVariants: [], currentVariant: any) => {
                return [
                    ...accumVariants,
                    currentVariant.attributes.reduce((accumAttributes: {}, currentAttribute: any) => {
                        const { code, value } = currentAttribute
                        return { ...accumAttributes, [code]: value, product: currentVariant.product }
                    }, {}),
                ]
            },
            [_product]
        )

        const options = _product.options
            ?.sort((a: any, b: any) => a.position - b.position)
            .map((option: any) => {
                const { id, label, code, items = [] } = option

                const type = items[0]?.swatch?.__typename

                return {
                    id,
                    type,
                    label,
                    code,
                    items,
                }
            })

        return { options, variants }
    }, [_product])

    /**
     * Handle Select Option
     */
    const handleSelectVariant = useCallback(
        (options: { [code: string]: string }) => {
            if (!_product || !optionsAndVariants) return

            const optionsList = Object.keys(options)

            const variant = optionsAndVariants.variants.find(v => {
                return optionsList.reduce((accum: boolean, code) => {
                    return Number(v[code]) === Number(options[code]) && accum
                }, true)
            })

            if (variant) {
                const { variantSku, price, gallery, specialPrice, stock } = variant.product

                setProductVariant({
                    variantSku,
                    price,
                    gallery:
                        gallery.length === 1 // if only one variant image
                            ? [
                                  gallery[0], // add first variant pic
                                  ..._product.gallery.slice(1), // but keep showing the rest
                              ]
                            : [...gallery], // otherwise replace by variant image
                    specialPrice,
                    stock,
                })
            }
        },
        [_product, setProductVariant, optionsAndVariants]
    )

    /**
     * Handle Add To Cart Simple Product
     */
    const [addSimpleProductsToCart, addingSimpleProductsToCart] = useMutation(ADD_SIMPLE_PRODUCTS_TO_CART_MUTATION, {
        update(cache, { data: { addToCart } }) {
            const { cart } = addToCart
            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleAddSimpleProductToCart = useCallback(
        async (variables: { cartId: string; sku: string; quantity: number }) => {
            const { cartId, sku, quantity } = variables
            const { data } = await addSimpleProductsToCart({
                variables: {
                    cartId,
                    sku,
                    quantity,
                },
            })
            return data
        },
        [addSimpleProductsToCart]
    )

    /**
     * Handle Add To Cart Configurable Product
     */
    const [addConfigurableProductsToCart, addingConfigurableProductToCart] = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION, {
        update(cache, { data: { addToCart } }) {
            const { cart } = addToCart

            cache.writeData({
                data: { cart },
            })
        },
    })

    const handleAddConfigurableProductToCart = useCallback(
        async (variables: { cartId: string; quantity: number; sku: string; variantSku: string }) => {
            const { cartId, sku, variantSku, quantity } = variables
            const { data } = await addConfigurableProductsToCart({
                variables: {
                    cartId,
                    parentSku: sku,
                    sku: variantSku,
                    quantity,
                },
            })
            return data
        },
        [addConfigurableProductsToCart]
    )

    return {
        queries: {
            product: {
                ...product,
                data: {
                    ...product.data,
                    product: _product
                        ? {
                              ..._product,
                              ...productVariant,
                              ...optionsAndVariants,
                          }
                        : undefined,
                },
            },
        },
        api: {
            selectVariant: handleSelectVariant,
            addSimpleProductToCart: handleAddSimpleProductToCart,
            addingSimpleProductsToCart,
            addConfigurableProductToCart: handleAddConfigurableProductToCart,
            addingConfigurableProductToCart,
        },
    }
}
