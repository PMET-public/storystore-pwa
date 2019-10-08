import { Reducer, useReducer, useCallback, useEffect } from 'react'
import { getTotalCartQuantity } from '../../lib/getTotalCartQuantity'

import ADD_TO_CART_MUTATION from './addSimpleProductsToCart.graphql'
import ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION from './addSimpleProductsToCart.graphql'

import { useMutation } from '@apollo/react-hooks'
import { useAppContext } from 'luma-ui/dist/AppProvider'

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

type Variant = { [code: string]: number } & {
    gallery: ProductGallery
    product: Product & { sku: string }
}

type Price = {
    amount: {
        currency?: string
        value: number
    }
}

type Product = {
    stock: string
    specialPrice?: number
    price: {
        regular: Price
        minimal?: Price
    }
    gallery: ProductGallery
}

type ReducerStateSimpleProduct = {
    type: 'simple'
}

type ReducerStateConfigurableProduct = {
    type: 'configurable'
    options: {
        items: Array<Option>
        selected?: OptionsSelected
    }
    variants: {
        items: Array<Variant>
        selected?: string
    }
}

type ReducerState = {
    isAddToCartLoading?: boolean
    isAddToCartValid?: boolean
    product: Product
} & (ReducerStateSimpleProduct | ReducerStateConfigurableProduct)

type ReducerActions =
    | {
          type: 'init'
          payload: ReducerState
      }
    | {
          type: 'selectOption'
          payload: {
              product: Product
              options: OptionsSelected
              variantSku: string
          }
      }
    | {
          type: 'setAddToCartLoading'
          payload: boolean
      }
    | {
          type: 'setAddToCartValid'
          payload: boolean
      }

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'init':
            return {
                ...action.payload,
            }

        case 'selectOption':
            return state.type === 'configurable'
                ? {
                      ...state,
                      variants: {
                          ...state.variants,
                          selected: action.payload.variantSku,
                      },
                      options: {
                          ...state.options,
                          selected: {
                              ...state.options.selected,
                              ...action.payload.options,
                          },
                      },
                      product: {
                          ...state.product,
                          ...action.payload.product,
                      },
                  }
                : { ...state }

        case 'setAddToCartLoading':
            return {
                ...state,
                isAddToCartLoading: action.payload,
            }

        case 'setAddToCartValid':
            return {
                ...state,
                isAddToCartValid: action.payload,
            }

        default:
            throw `Reducer action not valid.`
    }
}

const initialState: ReducerState = {
    type: 'simple',
    isAddToCartLoading: false,
    isAddToCartValid: false,
    product: {
        stock: '',
        price: {
            regular: {
                amount: {
                    value: 0,
                },
            },
        },
        gallery: [],
    },
}

export default (_product: any) => {
    const app = useAppContext()
    const [state, dispatch] = useReducer(reducer, initialState)
    const addSimpleProductsToCartMutation = useMutation(ADD_TO_CART_MUTATION)
    const addConfigurableProductsToCartMutation = useMutation(ADD_CONFIGURABLE_PRODUCTS_TO_MUTATION)

    const handleAddToCart = useCallback(
        (method: (variables: any) => Promise<any>, variables) => {
            const quantity = 1
            const { cartId } = app.state

            dispatch({ type: 'setAddToCartLoading', payload: true })

            method({ variables: { cartId, quantity, ...variables } })
                .then(res => {
                    app.actions.setCartCount(getTotalCartQuantity(res.data.addToCart.cart.items))
                })
                .catch(error => {
                    console.error(error.message)
                })
                .finally(() => {
                    dispatch({ type: 'setAddToCartLoading', payload: false })
                })
        },
        [_product && _product.id]
    )

    useEffect(() => {
        if (!_product) return

        const { type, sku, stock, specialPrice, price, gallery } = _product

        const product = { type, sku, stock, specialPrice, price, gallery }

        if (type === 'configurable') {
            const variants = _product.variants.reduce((accumVariants: [], currentVariant: any) => {
                return [
                    ...accumVariants,
                    currentVariant.attributes.reduce((accumAttributes: {}, currentAttribute: any) => {
                        const { code, value } = currentAttribute
                        return { ...accumAttributes, [code]: value, product: currentVariant.product }
                    }, {}),
                ]
            }, [])

            const options = _product.options
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

            dispatch({
                type: 'init',
                payload: {
                    type: 'configurable',
                    isAddToCartValid: false,
                    product,
                    options: {
                        items: options,
                    },
                    variants: {
                        items: variants,
                    },
                },
            })
        } else {
            dispatch({
                type: 'init',
                payload: {
                    type: 'simple',
                    isAddToCartValid: true,
                    product,
                },
            })
        }
    }, [_product && _product.id])

    useEffect(() => {
        if (state.type !== 'configurable') return

        dispatch({
            type: 'setAddToCartValid',
            payload: state.options.selected
                ? Object.keys(state.options.selected).length === state.options.items.length
                : false,
        })
    }, [state.type === 'configurable' && JSON.stringify(state.options.selected)])

    return {
        state,
        actions: {
            handleSelectOption: (code: string, label: string, value: number) => {
                if (state.type !== 'configurable') return

                const options: OptionsSelected = { ...state.options.selected, [code]: { label, value } }

                const optionsList = Object.keys(options)

                const variant = state.variants.items.find(v => {
                    return optionsList.reduce((accum: boolean, x) => {
                        return v[x] === options[x].value && accum
                    }, true)
                })

                if (!variant) return console.error('Variant not found')

                const { sku, stock, specialPrice, price, gallery } = variant.product

                dispatch({
                    type: 'selectOption',
                    payload: {
                        product: {
                            stock,
                            specialPrice,
                            price,
                            gallery,
                        },
                        options,
                        variantSku: sku,
                    },
                })
            },

            handleAddSimpleProductToCart: (sku: string) => {
                const [method] = addSimpleProductsToCartMutation

                handleAddToCart(method, {
                    sku,
                })
            },
            handleAddConfigurableProductToCart: (sku: string, variantSku: string) => {
                const [method] = addConfigurableProductsToCartMutation

                handleAddToCart(method, {
                    parentSku: sku,
                    sku: variantSku,
                })
            },
        },
    }
}
