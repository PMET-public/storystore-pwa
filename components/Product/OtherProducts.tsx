import React, { FunctionComponent } from 'react'
import { CarouselWrapper, Title } from './OtherProducts.styled'
import { useQuery } from '@apollo/client'
import dynamic from 'next/dynamic'
import OTHER_PRODUCTS_QUERY from './graphql/OtherProducts.graphql'
import { resolveImage } from '~/lib/resolveImage'
import { priceDataToProps } from './Product'
import Link from '../Link'
const ProductCarousel = dynamic(() => import('~/components/ProductCarousel'))

const ProductCarouselOptions = {
    slidesToShow: 5,
    responsive: [
        {
            breakpoint: 2599,
            settings: {
                slidesToShow: 4,
            },
        },
        {
            breakpoint: 1599,
            settings: {
                slidesToShow: 3,
            },
        },
        {
            breakpoint: 991,
            settings: {
                slidesToShow: 2,
            },
        },
        {
            breakpoint: 599,
            settings: {
                slidesToShow: 1,
            },
        },
    ],
}

export type OtherProductsProps = {
    urlKey: string
}

export const OtherProducts: FunctionComponent<OtherProductsProps> = ({ urlKey }) => {
    const { loading, data } = useQuery(OTHER_PRODUCTS_QUERY, { variables: { urlKey } })

    const product = data?.product?.items[0]

    return (
        <React.Fragment>
            {/* Related Products */}
            {product?.related?.length > 0 && (
                <CarouselWrapper>
                    <Title>Related Products</Title>
                    <ProductCarousel
                        loading={loading && !product?.related}
                        items={product.related.map(({ id, title, image, price, options, urlKey, urlSuffix = '' }: any) => ({
                            _id: id,
                            title: {
                                text: title,
                            },
                            as: Link,
                            href: `/${urlKey}${urlSuffix}`,
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
                            price: priceDataToProps(price),
                            colors: options
                                ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                                ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                        }))}
                        {...ProductCarouselOptions}
                    />
                </CarouselWrapper>
            )}

            {/* Upsell Products */}
            {product?.upsell?.length > 0 && (
                <CarouselWrapper>
                    <Title>You may also like</Title>
                    <ProductCarousel
                        loading={loading && !product?.upsell}
                        items={product.upsell.map(({ title, image, price, options, urlKey = '' }: any) => ({
                            title: {
                                text: title,
                            },
                            as: Link,
                            href: `/${urlKey}${urlKey}`,
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
                            price: priceDataToProps(price),
                            colors: options
                                ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                                ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                        }))}
                        {...ProductCarouselOptions}
                    />
                </CarouselWrapper>
            )}
        </React.Fragment>
    )
}
