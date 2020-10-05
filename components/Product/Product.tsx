import React, { createContext, FunctionComponent, useCallback, useContext, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Root, Wrapper, Images, Image, Carousel, CarouselItem, GalleryGrid, InfoWrapper, InfoInnerWrapper, Info, Header, Title, Sku, ShortDescription, Description } from './Product.styled'

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
import { OtherProducts } from './OtherProducts'

const SimpleProduct = dynamic(() => import('./ProductTypes/SimpleProduct'))
const GroupedProduct = dynamic(() => import('./ProductTypes/GroupedProduct'))
const VirtualProduct = dynamic(() => import('./ProductTypes/VirtualProduct'))
const DownloadableProduct = dynamic(() => import('./ProductTypes/DownloadableProduct'))
const ConfigurableProduct = dynamic(() => import('./ProductTypes/ConfigurableProduct'))
const GiftCard = dynamic(() => import('./ProductTypes/GiftCard'))

const ErrorComponent = dynamic(() => import('~/components/Error'))

export type ProductGallery = Array<{
    label: string
    url: string
}>

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

export const priceDataToProps = (data: any) => {
    if (!data) return undefined

    return {
        label: data.maximum.regular.value > data.minimum.regular.value ? 'Starting at' : undefined,
        regular: data.minimum.regular.value,
        special: data.minimum.discount.amountOff && data.minimum.final.value - data.minimum.discount.amountOff,
        currency: data.minimum.regular.currency,
    }
}

export const useProductLayout = () => useContext(ProductContext)

const ProductContext = createContext({
    setGallery: (_: ProductGallery) => {},
    setPrice: (_: PriceProps) => {},
})

export const Product: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const product = data?.product?.items[0]

    const layout: 'FULL_WIDTH' | 'COLUMN' = 'FULL_WIDTH'

    const shortDescription = useHtml(product?.shortDescription.html)

    const [gallery = product?.gallery, setGallery] = useState<ProductGallery>()

    const handleUpdateGallery = useCallback((value: ProductGallery) => {
        setGallery(value)
    }, [])

    const [price = priceDataToProps(product?.price), setPrice] = useState<PriceProps>()

    const handleUpdatePrice = useCallback((value: PriceProps) => {
        setPrice(value)
    }, [])

    const categoryUrlSuffix = data?.store?.categoryUrlSuffix ?? ''

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
        <ProductContext.Provider value={{ setPrice: handleUpdatePrice, setGallery: handleUpdateGallery }}>
            {product && <Head title={product.metaTitle || product.title} description={product.metaDescription} keywords={product.metaKeywords} />}

            <Root>
                <Wrapper>
                    <ProductGallery items={gallery} />

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
                                        {product.type === 'SimpleProduct' && <SimpleProduct {...product} />}

                                        {product.type === 'ConfigurableProduct' && <ConfigurableProduct {...product} />}

                                        {product.type === 'GroupedProduct' && <GroupedProduct {...product} />}

                                        {product.type === 'VirtualProduct' && <VirtualProduct {...product} />}

                                        {product.type === 'DownloadableProduct' && <DownloadableProduct {...product} />}

                                        {/* TODO: ... */}
                                        {product.type === 'GiftCard' && <GiftCard {...product} />}

                                        {/* {layout === 'COLUMN' && product?.description?.html && <Description as={PageBuilder} html={product.description.html} />} */}
                                    </React.Fragment>
                                )}
                            </Info>
                        </InfoInnerWrapper>
                    </InfoWrapper>
                </Wrapper>

                {layout === 'FULL_WIDTH' && product?.description?.html && <Description as={PageBuilder} html={product.description.html} />}

                {product?.urlKey && <OtherProducts urlKey={product.urlKey} />}
            </Root>
        </ProductContext.Provider>
    )
}
