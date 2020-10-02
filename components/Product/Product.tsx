import React, { FunctionComponent, useMemo, createContext, useReducer, Reducer } from 'react'
import dynamic from 'next/dynamic'
import {
    Root,
    Wrapper,
    Images,
    Image,
    Carousel,
    CarouselItem,
    GalleryGrid,
    InfoWrapper,
    InfoInnerWrapper,
    Info,
    Header,
    Title,
    Sku,
    ShortDescription,
    Description,
    CarouselWrapper,
} from './Product.styled'

import useNetworkStatus from '~/hooks/useNetworkStatus'
import { resolveImage } from '~/lib/resolveImage'
import { QueryResult } from '@apollo/client'
import Head from '~/components/Head'
import Link from '~/components/Link'
import { ProductDetailsSkeleton } from './ProductDetails.skeleton'
import { ProductImageSkeleton } from './ProductImage.skeleton'
import Price, { PriceProps } from '@storystore/ui/dist/components/Price'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import PageBuilder from '~/components/PageBuilder'
import useHtml from '~/hooks/useHtml'

const SimpleProduct = dynamic(() => import('./ProductTypes/SimpleProduct'))
const GroupedProduct = dynamic(() => import('./ProductTypes/GroupedProduct'))
const VirtualProduct = dynamic(() => import('./ProductTypes/VirtualProduct'))
const DownloadableProduct = dynamic(() => import('./ProductTypes/DownloadableProduct'))
const ConfigurableProduct = dynamic(() => import('./ProductTypes/ConfigurableProduct'))
const GiftCard = dynamic(() => import('./ProductTypes/GiftCard'))

const ProductCarousel = dynamic(() => import('~/components/ProductCarousel'))

const ErrorComponent = dynamic(() => import('~/components/Error'))

export type ProductGallery = Array<{
    label: string
    url: string
}>

type State = {
    price: PriceProps | null
    gallery: ProductGallery
}

type Action =
    | {
          type: 'setPrice'
          payload: PriceProps | null
      }
    | {
          type: 'setGallery'
          payload: ProductGallery
      }

export const ProductContext = createContext<{
    setGallery: (data: ProductGallery) => any
    setPrice: (data: PriceProps | null) => any
}>({
    setGallery: _ => {},
    setPrice: _ => {},
})

const reducer: Reducer<State, Action> = (state, action) => {
    switch (action.type) {
        case 'setPrice':
            return { ...state, price: action.payload }

        case 'setGallery':
            return { ...state, gallery: action.payload }

        default:
            throw `Reducer action not valid.`
    }
}

const ProductGallery: FunctionComponent<{ items: ProductGallery }> = ({ items }) => {
    const gallery = useMemo(() => {
        return items
            ?.filter((x: any) => x.type === 'ProductImage')
            .map(({ label, url }: any) => ({
                alt: label ?? '',
                src: resolveImage(url, { width: 960 }),
                sources: [
                    <source key="mobile-webp" type="image/webp" media="(max-width: 599px)" srcSet={resolveImage(url, { width: 960, height: 960, type: 'webp' })} />,
                    <source key="mobile" media="(max-width: 599px)" srcSet={resolveImage(url, { width: 960, height: 960 })} />,
                    <source key="desktop-webp" type="image/webp" media="(min-width: 600px)" srcSet={resolveImage(url, { width: 1260, type: 'webp' })} />,
                    <source key="desktop" media="(min-width: 600px)" srcSet={resolveImage(url, { width: 1260 })} />,
                ],
            }))
            .sort((a: any, b: any) => a.position - b.position)
    }, [items])

    return (
        <Images>
            {/* Mobile Gallery Carousel */}
            <Carousel gap={1} padding={3} show={1} snap hideScrollBar>
                {gallery ? (
                    gallery.map((image: any, index: number) => (
                        <CarouselItem key={index}>
                            <Image {...image} lazy={index > 0} width={960} height={960} />
                        </CarouselItem>
                    ))
                ) : (
                    <CarouselItem>
                        <ProductImageSkeleton />
                    </CarouselItem>
                )}
            </Carousel>

            {/* Tablet and Desktop Gallery Grid */}
            <GalleryGrid>
                {gallery ? (
                    gallery.map((image: any, index: number) => (
                        <CarouselItem key={index}>
                            <Image {...image} lazy={index > 0} width={1260} height={1260} originalWidthAndHeight />
                        </CarouselItem>
                    ))
                ) : (
                    <>
                        <CarouselItem>
                            <ProductImageSkeleton />
                        </CarouselItem>
                    </>
                )}
            </GalleryGrid>
        </Images>
    )
}

export const Product: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const product = data?.product?.items[0]

    const layout: 'FULL_WIDTH' | 'COLUMN' = 'FULL_WIDTH'

    const shortDescription = useHtml(product?.shortDescription.html)

    const [{ price, gallery }, dispatch] = useReducer(reducer, {
        price: product?.price && {
            label: product.price.maximum.regular.value > product.price.minimum.regular.value ? 'Starting at' : undefined,
            regular: product.price.minimum.regular.value,
            special: product.price.minimum.discount.amountOff && product.price.minimum.final.value - product.price.minimum.discount.amountOff,
            currency: product.price.minimum.regular.currency,
        },

        gallery: product?.gallery,
    })

    const categoryUrlSuffix = data?.store?.categoryUrlSuffix ?? ''

    const productUrlSuffix = data?.store?.productUrlSuffix ?? ''

    if (!online && !product) return <ErrorComponent type="Offline" fullScreen />

    if (!loading && !product) {
        debugger
        return (
            <ErrorComponent type="404" button={{ text: 'Search', as: Link, href: '/search' }}>
                We&apos;re sorry, we coudn&apos;t find the product.
            </ErrorComponent>
        )
    }

    return (
        <ProductContext.Provider value={{ setGallery: payload => dispatch({ type: 'setGallery', payload }), setPrice: payload => dispatch({ type: 'setPrice', payload }) }}>
            {product && <Head title={product.metaTitle || product.title} description={product.metaDescription} keywords={product.metaKeywords} />}

            <Root>
                <Wrapper>
                    <ProductGallery items={gallery ?? product?.gallery} />

                    <InfoWrapper>
                        <InfoInnerWrapper>
                            <Info>
                                {loading && !product ? (
                                    <ProductDetailsSkeleton style={{ width: '56rem', minWidth: '100%', maxWidth: '100%' }} />
                                ) : (
                                    <React.Fragment>
                                        <Header>
                                            {product.categories && (
                                                <Breadcrumbs
                                                    prefix="#"
                                                    items={product.categories
                                                        .slice(0, 4) // limit to 3
                                                        .filter((x: any) => !!x.href)
                                                        .map(({ id, mode, text, href }: any) => ({
                                                            _id: id,
                                                            as: Link,
                                                            urlResolver: {
                                                                type: 'CATEGORY',
                                                                id,
                                                                mode,
                                                            },
                                                            href: '/' + href + categoryUrlSuffix,
                                                            text,
                                                        }))}
                                                />
                                            )}

                                            <Title>{product.title}</Title>

                                            {price && <Price {...price} />}

                                            {product.sku && <Sku>SKU. {product.sku}</Sku>}
                                        </Header>

                                        {shortDescription && <ShortDescription>{shortDescription}</ShortDescription>}

                                        {/* Product Type Form */}
                                        {product.type === 'SimpleProduct' && <SimpleProduct sku={product.sku} inStock={product.stock === 'IN_STOCK'} />}

                                        {product.type === 'GroupedProduct' && (
                                            <GroupedProduct
                                                items={product.group?.map((group: any) => ({
                                                    quantity: group.quantity,
                                                    sku: group.product.sku,
                                                    name: group.product.name,
                                                    price: group.product.price,
                                                    stock: group.product.stock,
                                                }))}
                                                inStock={product.stock === 'IN_STOCK'}
                                            />
                                        )}

                                        {product.type === 'DownloadableProduct' && <DownloadableProduct {...product} />}

                                        {product.type === 'VirtualProduct' && <VirtualProduct sku={product.sku} inStock={product.stock === 'IN_STOCK'} />}

                                        {product.type === 'GiftCard' && <GiftCard sku={product.sku} inStock={product.stock === 'IN_STOCK'} />}

                                        {product.type === 'ConfigurableProduct' && <ConfigurableProduct {...product} />}

                                        {layout === 'COLUMN' && product?.description?.html && <Description as={PageBuilder} html={product.description.html} />}
                                    </React.Fragment>
                                )}
                            </Info>
                        </InfoInnerWrapper>
                    </InfoWrapper>
                </Wrapper>

                {layout === 'FULL_WIDTH' && product?.description?.html && <Description as={PageBuilder} html={product.description.html} />}

                {/* Related Products */}
                {product?.related?.length > 0 && (
                    <CarouselWrapper>
                        <Title>Related Products</Title>
                        <ProductCarousel
                            loading={loading && !product?.related}
                            items={product.related.map(({ id, title, urlKey, image, price, options }: any) => ({
                                _id: id,
                                title: {
                                    text: title,
                                },
                                as: Link,
                                href: `/${urlKey}${productUrlSuffix}`,
                                urlResolver: {
                                    type: 'PRODUCT',
                                    urlKey,
                                },
                                image: {
                                    alt: image.alt,
                                    src: resolveImage(image.src, { width: 1260 }),
                                    sources: [
                                        <source key="webp" type="image/webp" srcSet={resolveImage(image.src, { width: 1260, type: 'webp' })} />,
                                        <source key="original" srcSet={resolveImage(image.src, { width: 1260 })} />,
                                    ],
                                },
                                price: {
                                    label: price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                                    regular: price.minimum.regular.value,
                                    special: price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff,
                                    currency: price.minimum.regular.currency,
                                },
                                colors: options
                                    ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                                    ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                            }))}
                        />
                    </CarouselWrapper>
                )}

                {/* Upsell Products */}
                {product?.upsell?.length > 0 && (
                    <CarouselWrapper>
                        <Title>You may also like</Title>
                        <ProductCarousel
                            loading={loading && !product?.upsell}
                            items={product.upsell.map(({ title, urlKey, image, price, options }: any) => ({
                                title: {
                                    text: title,
                                },
                                as: Link,
                                href: `/${urlKey}${productUrlSuffix}`,
                                urlResolver: {
                                    type: 'PRODUCT',
                                    urlKey,
                                },
                                image: {
                                    alt: image.alt,
                                    src: resolveImage(image.src, { width: 1260 }),
                                    sources: [
                                        <source key="webp" type="image/webp" srcSet={resolveImage(image.src, { width: 1260, type: 'webp' })} />,
                                        <source key="original" srcSet={resolveImage(image.src, { width: 1260 })} />,
                                    ],
                                },
                                price: {
                                    label: price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                                    regular: price.minimum.regular.value,
                                    special: price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff,
                                    currency: price.minimum.regular.currency,
                                },
                                colors: options
                                    ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                                    ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                            }))}
                        />
                    </CarouselWrapper>
                )}
            </Root>
        </ProductContext.Provider>
    )
}
