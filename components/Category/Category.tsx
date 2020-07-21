import React, { FunctionComponent, useState } from 'react'
import dynamic from 'next/dynamic'
import { Root, TopBar, TopBarWrapper, Heading, Title } from './Category.styled'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import Link from '~/components/Link'
import Head from '~/components/Head'
import ProductList from '@storystore/ui/dist/components/ProductList'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import Pills from '@storystore/ui/dist/components/Pills'
import { Skeleton } from '@storystore/ui/dist/components/Skeleton'
import { QueryResult } from '@apollo/client'
import { resolveImage } from '~/lib/resolveImage'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'), { ssr: false })

const TitleSkeleton = ({ ...props }) => {
    return (
        <Skeleton height={16} width={200} {...props}>
            <rect x="0" y="0" width="200" height="16" />
        </Skeleton>
    )
}

export const Category: FunctionComponent<QueryResult> = ({ loading, data, fetchMore }) => {
    const categoryUrlSuffix = data?.storeConfig.categoryUrlSuffix

    const productUrlSuffix = data?.storeConfig.categoryUrlSuffix

    const page = data?.categoryList && data.categoryList[0]

    const mode = page?.mode || 'PRODUCTS'

    const products = page?.products

    const [loadingMoreProducts, setLoadingMoreProducts] = useState(false)

    /**
     * Infinite Scroll Effect
     */
    useFetchMoreOnScrolling(
        {
            threshold: 400,
            loading: loading || loadingMoreProducts,
            hasNextPage: products?.pagination && products?.pagination.current < products?.pagination.total,
        },
        () => {
            if (!products?.pagination?.current) return

            setLoadingMoreProducts(true)

            fetchMore({
                variables: {
                    currentPage: products.pagination.current + 1, // next page
                },
                updateQuery: (prev: any, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev
                    return {
                        ...prev,
                        categoryList: [
                            {
                                ...prev.categoryList[0],
                                products: {
                                    ...prev.categoryList[0].products,
                                    ...fetchMoreResult.categoryList[0].products,
                                    items: [...prev.categoryList[0].products.items, ...fetchMoreResult.categoryList[0].products.items],
                                },
                            },
                        ],
                    }
                },
            })
                .then(() => {
                    setLoadingMoreProducts(false)
                })
                .catch(() => {})
        }
    )

    const online = useNetworkStatus()

    if (!online && !data?.categoryList) return <Error type="Offline" fullScreen />

    if (!loading && !data?.categoryList) {
        return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />
    }

    return (
        <React.Fragment key={`category--${mode}--${page?.id}`}>
            {/* Head Metadata */}
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>
                {/* PageBuilder Content */}
                {(mode === 'PRODUCTS_AND_PAGE' || mode === 'PAGE') && <PageBuilder html={page?.block?.content || page?.description} />}

                {/* Product List */}
                {(mode === 'PRODUCTS_AND_PAGE' || mode === 'PRODUCTS') && (
                    <React.Fragment>
                        <TopBar>
                            <TopBarWrapper $margin>
                                <Heading>
                                    <Title>{!page?.title && loading ? <TitleSkeleton /> : page.title}</Title>

                                    {/* Breadcrumbs */}
                                    {page?.categories?.length === 0 && page.breadcrumbs && (
                                        <Breadcrumbs
                                            prefix="#"
                                            items={page.breadcrumbs.map(({ id, mode, text, href }: any) => ({
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

                                    {/* Sub-Categories */}
                                    {page?.categories && (
                                        <Pills
                                            items={page.categories.map(({ id, mode, text, count, href }: any) => ({
                                                _id: id,
                                                as: Link,
                                                urlResolver: {
                                                    type: 'CATEGORY',
                                                    id,
                                                    mode,
                                                },
                                                count,
                                                text,
                                                href: '/' + href + categoryUrlSuffix,
                                            }))}
                                        />
                                    )}
                                </Heading>
                            </TopBarWrapper>
                        </TopBar>

                        <ProductList
                            loading={loading}
                            loadingMore={loading || loadingMoreProducts}
                            items={products?.items
                                ?.filter((x: any) => !!x) // patches results returning nulls. I'm looking at you Gift Cards
                                .map(({ id, image, price, title, urlKey, options }: any, index: number) => ({
                                    _id: `${id}--${index}`,
                                    as: Link,
                                    href: `/${urlKey + productUrlSuffix}`,
                                    urlResolver: {
                                        type: 'PRODUCT',
                                        id,
                                        urlKey,
                                    },
                                    image: {
                                        alt: image.alt,
                                        src: {
                                            desktop: resolveImage(image.src, { width: 1260 }),
                                            mobile: resolveImage(image.src, { width: 960 }),
                                        },
                                        width: 1274,
                                        height: 1580,
                                    },
                                    price: {
                                        label: price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                                        regular: price.minimum.regular.value,
                                        special: price.minimum.discount.amountOff && price.minimum.final.value - price.minimum.discount.amountOff,
                                        currency: price.minimum.regular.currency,
                                    },
                                    title: {
                                        text: title,
                                    },
                                    colors: options
                                        ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch?.__typename === 'ColorSwatchData'))
                                        ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                                }))}
                        />
                    </React.Fragment>
                )}
            </Root>
        </React.Fragment>
    )
}
