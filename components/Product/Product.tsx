import React, { FunctionComponent, useMemo, createContext, useState } from 'react'
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
import Price from '@storystore/ui/dist/components/Price'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import PageBuilder from '~/components/PageBuilder'

// @ts-ignore
const SimpleProduct = dynamic(() => import('./ProductTypes/SimpleProduct').then(m => m.SimpleProduct))

// @ts-ignore
const ConfigurableProduct = dynamic(() => import('./ProductTypes/ConfigurableProduct').then(m => m.ConfigurableProduct))

const ProductCarousel = dynamic(() => import('@storystore/ui/dist/components/ProductCarousel'), { ssr: false })

const ErrorComponent = dynamic(() => import('~/components/Error'))

export const ProductContext = createContext<{
    selectedVariant?: number
    setSelectedVariantIndex: (value: number) => any
}>({
    setSelectedVariantIndex: _ => {},
})

// export const getProductPropsFromQuery = ({ loading, data }: QueryResult) => {
//     const product = data?.product?.items[0]

//     return {
//         product,
//     }
// }

export const Product: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const [selectedVariantIndex, setSelectedVariantIndex] = useState(-1)

    const product = useMemo(() => {
        let _product = data?.product?.items[0]

        if (selectedVariantIndex > -1) {
            const _variant = data?.product?.items[0].variants[selectedVariantIndex].product
            let gallery = [..._variant.gallery]

            if (_variant.gallery.length === 1) {
                gallery = [...gallery, ...[..._product.gallery].splice(1)]
            }

            _product = {
                ..._product,
                ..._variant,
                gallery,
            }
        }

        return _product
    }, [data, selectedVariantIndex])

    const categoryUrlSuffix = data?.store?.categoryUrlSuffix ?? ''

    const productUrlSuffix = data?.store?.productUrlSuffix ?? ''

    const gallery = useMemo(() => {
        return product?.gallery
            ?.filter((x: any) => x.type === 'ProductImage')
            .map(({ label, url }: any) => ({
                alt: label || product?.title,
                src: {
                    desktop: resolveImage(url, { width: 1260 }),
                    mobile: resolveImage(url, { width: 960 }),
                },
            }))
            .sort((a: any, b: any) => a.position - b.position)
    }, [product])

    if (!online && !product) return <ErrorComponent type="Offline" fullScreen />

    if (!loading && !product) {
        return (
            <ErrorComponent type="404" button={{ text: 'Search', as: Link, href: '/search' }}>
                We&apos;re sorry, we coudn&apos;t find the product.
            </ErrorComponent>
        )
    }

    // Pending support of other Product Types
    if (product?.type && product.type !== 'ConfigurableProduct' && product.type !== 'SimpleProduct') {
        return <ErrorComponent type="500">Product type: {product.type} not supported.</ErrorComponent>
    }

    return (
        <ProductContext.Provider value={{ setSelectedVariantIndex }}>
            {product && <Head title={product.metaTitle || product.title} description={product.metaDescription} keywords={product.metaKeywords} />}

            <Root>
                <Wrapper>
                    <Images>
                        {/* Mobile Gallery Carousel */}
                        <Carousel gap={1} padding={3} show={1} snap hideScrollBar>
                            {gallery ? (
                                gallery.map((image: any, index: number) => (
                                    <CarouselItem key={index}>
                                        <Image {...image} height={1580} width={1274} vignette />
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
                                        <Image {...image} height={1580} width={1274} vignette />
                                    </CarouselItem>
                                ))
                            ) : (
                                <>
                                    <CarouselItem>
                                        <ProductImageSkeleton />
                                    </CarouselItem>
                                    <CarouselItem>
                                        <ProductImageSkeleton />
                                    </CarouselItem>
                                    <CarouselItem>
                                        <ProductImageSkeleton />
                                    </CarouselItem>
                                </>
                            )}
                        </GalleryGrid>
                    </Images>

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

                                            <Price
                                                label={product.price.maximum.regular.value > product.price.minimum.regular.value ? 'Starting at' : undefined}
                                                regular={product.price.minimum.regular.value}
                                                special={product.price.minimum.discount.amountOff && product.price.minimum.final.value - product.price.minimum.discount.amountOff}
                                                currency={product.price.minimum.regular.currency}
                                            />
                                            {product.sku && <Sku>SKU. {product.sku}</Sku>}
                                        </Header>

                                        {product.shortDescription?.html && <ShortDescription dangerouslySetInnerHTML={{ __html: product.shortDescription.html }} />}

                                        {/* Product Type Form */}
                                        {product.type === 'SimpleProduct' && <SimpleProduct sku={product.sku} inStock={product.stock === 'IN_STOCK'} />}
                                        {product.type === 'ConfigurableProduct' && (
                                            <ConfigurableProduct
                                                sku={product.sku}
                                                variantSku={product.variantSku}
                                                inStock={product.stock === 'IN_STOCK'}
                                                options={product.options}
                                                variants={product.variants.reduce((accumVariants: any[], current: any) => {
                                                    return [
                                                        ...accumVariants,
                                                        current.attributes.reduce((accumAttributes: {}, currentAttribute: any) => {
                                                            const { code, value } = currentAttribute
                                                            return { ...accumAttributes, [code]: value }
                                                        }, {}),
                                                    ]
                                                }, [])}
                                            />
                                        )}

                                        {product?.description?.html && <Description as={PageBuilder} html={product.description.html} />}
                                    </React.Fragment>
                                )}
                            </Info>
                        </InfoInnerWrapper>
                    </InfoWrapper>
                </Wrapper>

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
                                    src: {
                                        desktop: resolveImage(image.src, { width: 1260 }),
                                        mobile: resolveImage(image.src, { width: 960 }),
                                    },
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
                                    src: {
                                        desktop: resolveImage(image.src, { width: 1260 }),
                                        mobile: resolveImage(image.src, { width: 960 }),
                                    },
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
