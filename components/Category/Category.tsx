import React, { FunctionComponent, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { resolveImage } from '~/lib/resolveImage'

import { Root, TopBar, TopBarWrapper, Heading, Title, BackButton, BackIcon, TopBarFilterButton, FiltersIcon, Content, ProductListWrapper, FiltersWrapper } from './Category.styled'

import { useCategory } from './useCategory'
import { useFetchMoreOnScrolling } from '@storystore/ui/dist/hooks/useFetchMoreOnScrolling'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'

import Link from '~/components/Link'
import Head from '~/components/Head'
import ProductList from '@storystore/ui/dist/components/ProductList'
import Filters from '~/components/Filters'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import Pills from '@storystore/ui/dist/components/Pills'
import { Skeleton } from '@storystore/ui/dist/components/Skeleton'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'), { ssr: false })

type CategoryProps = {
    id: number
    mode?: 'PRODUCTS_AND_PAGE' | 'PRODUCTS' | 'PAGE' | string
}

const TitleSkeleton = ({ ...props }) => {
    return (
        <Skeleton height={16} width={200} {...props}>
            <rect x="0" y="0" width="200" height="16" />
        </Skeleton>
    )
}

export const Category: FunctionComponent<CategoryProps> = ({ id, mode: _mode = 'PRODUCTS' }) => {
    const { queries, api } = useCategory({ id })

    const products = queries.products.data?.products || []

    /**
     * Infinite Scroll Effect
     */
    useFetchMoreOnScrolling({ threshold: 400, loading: queries.products.loading, hasNextPage: products?.pagination && products.pagination.current < products.pagination.total }, () => {
        queries.products
            .fetchMore({
                variables: {
                    currentPage: products.pagination.current + 1, // next page
                },
                updateQuery: (prev: any, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev
                    return {
                        ...prev,
                        products: {
                            ...prev.products,
                            ...fetchMoreResult.products,
                            items: [...prev.products.items, ...fetchMoreResult.products.items],
                        },
                    }
                },
            })
            .catch(() => {})
    })

    const online = useNetworkStatus()

    const [showFilters, setShowFilter] = useState(true)

    const handleToggleFilters = useCallback(() => {
        setShowFilter(!showFilters)
    }, [showFilters, setShowFilter])

    if (!online && !queries.category.data?.page) return <Error type="Offline" fullScreen />

    if (!queries.category.loading && !queries.category.data?.page) {
        return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />
    }

    const page = queries.category.data?.page && queries.category.data.page[0]

    const categoryUrlSuffix = queries.category.data?.store?.categoryUrlSuffix ?? ''

    const productUrlSuffix = queries.products.data?.store?.productUrlSuffix ?? ''

    const mode = page?.mode || _mode

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
                                    <Title>
                                        {page?.breadcrumbs && (
                                            <BackButton
                                                as={Link}
                                                urlResolver={{
                                                    type: 'CATEGORY',
                                                    id: page.breadcrumbs[page.breadcrumbs.length - 1].id,
                                                    mode: page.breadcrumbs[page.breadcrumbs.length - 1].mode,
                                                }}
                                                href={'/' + page.breadcrumbs[page.breadcrumbs.length - 1].href + categoryUrlSuffix}
                                            >
                                                <BackIcon />
                                            </BackButton>
                                        )}
                                        {!page?.title && queries.category.loading ? <TitleSkeleton /> : page.title.text}
                                    </Title>

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

                                <TopBarFilterButton as="button" type="button" onClick={handleToggleFilters}>
                                    <span>
                                        <FiltersIcon aria-label="Filters" />
                                    </span>
                                </TopBarFilterButton>
                            </TopBarWrapper>
                        </TopBar>

                        <Content>
                            <ProductListWrapper $margin>
                                <ProductList
                                    loadingMore={queries.products.loading}
                                    items={products?.items
                                        ?.filter((x: any) => x !== null) // patches results returning nulls. I'm looking at you Gift Cards
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
                                                ?.find(({ items }: any) => !!items.find(({ swatch }: any) => swatch.__typename === 'ColorSwatchData'))
                                                ?.items.map(({ label, swatch }: any) => ({ label, value: swatch.value })),
                                        }))}
                                />
                            </ProductListWrapper>
                        </Content>
                        <FiltersWrapper $show={showFilters}>
                            <Filters
                                loading={queries.products.loading && queries.products.networkStatus !== 3}
                                items={queries.products.data?.products?.filters
                                    ?.filter(({ code }: any) => code !== 'category_id') // don't include Categories in the filters
                                    .map(({ title, code, options }: any) => {
                                        return {
                                            title,
                                            code,
                                            options: options.map(({ count, label, value }: any) => ({
                                                count,
                                                label,
                                                value,
                                            })),
                                        }
                                    })}
                                onValues={api.setFilter}
                            />
                        </FiltersWrapper>
                    </React.Fragment>
                )}
            </Root>
        </React.Fragment>
    )
}
