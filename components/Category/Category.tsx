import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { resolveImage } from '~/lib/resolveImage'

import {
    Root,
    TopBar,
    TopBarWrapper,
    Heading,
    Title,
    BackButton,
    BackIcon,
    // TopBarFilterButton,
    // FiltersIcon,
    Content,
    ProductListWrapper,
    // FiltersWrapper,
    // FiltersButtons,
    // FiltersScreen,
} from './Category.styled'

import { useCategory } from './useCategory'
import { useInfiniteScrolling } from '@pmet-public/luma-ui/hooks/useInfiniteScrolling'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'

import Link from '~/components/Link'
import Head from '~/components/Head'
import ProductList from '@pmet-public/luma-ui/components/ProductList'
// import Filters from '@pmet-public/luma-ui/components/Filters'
import Breadcrumbs from '@pmet-public/luma-ui/components/Breadcrumbs'
import Pills from '@pmet-public/luma-ui/components/Pills'
// import Button from '@pmet-public/luma-ui/components/Button'
import { Skeleton } from '@pmet-public/luma-ui/components/Skeleton'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'), { ssr: false })

type CategoryProps = {
    id: number
}

const TitleSkeleton = ({ ...props }) => {
    return (
        <Skeleton height={16} width={200} {...props}>
            <rect x="0" y="0" width="200" height="16" />
        </Skeleton>
    )
}

export const Category: FunctionComponent<CategoryProps> = ({ id }) => {
    const { queries } = useCategory({ id })

    /**
     * Infinite Scroll Effect
     */
    useInfiniteScrolling(() => {
        if (queries.products.loading) return

        const { products } = queries.products.data

        // ignore if it is loading or has no pagination
        if (!products?.pagination) return

        // don't run if it's in the last page
        if (!(products.pagination.current < products.pagination.total)) return

        // load more products
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

    if (!online && !queries.category.data.page) return <Error type="Offline" />

    if (!queries.category.loading && !queries.category.data.page) {
        return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />
    }

    const page = queries.category.data?.page && queries.category.data.page[0]

    const products = queries.products.data?.products

    const categoryUrlSuffix = queries.category.data?.store?.categoryUrlSuffix ?? ''

    const productUrlSuffix = queries.products.data?.store?.productUrlSuffix ?? ''

    return (
        <React.Fragment key={page?.id}>
            {/* Head Metadata */}
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>
                {/* PageBuilder Content */}
                {page?.cmsBlock && (page.mode === 'PRODUCTS_AND_PAGE' || page.mode === 'PAGE') && <PageBuilder html={page.cmsBlock} />}

                {/* Product List */}
                {/* TODO: && (page.mode === 'PRODUCTS_AND_PAGE' || page.mode === 'PRODUCTS') */}
                <>
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
                                        items={page.breadcrumbs.map(({ id, text, href }: any) => ({
                                            _id: id,
                                            as: Link,
                                            urlResolver: {
                                                type: 'CATEGORY',
                                                id,
                                            },
                                            href: '/' + href + categoryUrlSuffix,
                                            text,
                                        }))}
                                    />
                                )}

                                {/* Sub-Categories */}
                                {page?.categories && (
                                    <Pills
                                        items={page.categories.map(({ id, text, count, href }: any) => ({
                                            _id: id,
                                            as: Link,
                                            urlResolver: {
                                                type: 'CATEGORY',
                                                id,
                                            },
                                            count,
                                            text,
                                            href: '/' + href + categoryUrlSuffix,
                                        }))}
                                    />
                                )}
                            </Heading>

                            {/* TODO: Integrate Filters
                                <TopBarFilterButton as="button" type="button" onClick={handleToggleFilters}>
                                    <span>
                                        <FiltersIcon aria-label="Filters" />
                                    </span>
                                </TopBarFilterButton> 
                                */}
                        </TopBarWrapper>
                    </TopBar>

                    <Content>
                        <ProductListWrapper $margin>
                            <ProductList
                                loadingMore={queries.products.loading}
                                items={products?.items?.map(({ id, image, price, title, urlKey }: any, index: number) => ({
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
                                }))}
                            />
                        </ProductListWrapper>
                    </Content>

                    {/* TODO: Integrate Filters */}
                    {/* <FiltersWrapper $active={showFilter} $height={height} ref={filtersRef}>
                            <Filters {...filters} />
                            {filters.closeButton && (
                                <FiltersButtons>
                                    <Button
                                        as="button"
                                        type="button"
                                        onClick={handleCloseFilters}
                                        {...filters.closeButton}
                                    />
                                </FiltersButtons>
                            )}
                        </FiltersWrapper>

                        {showFilter && <FiltersScreen onClick={handleCloseFilters} />} */}
                </>
            </Root>
        </React.Fragment>
    )
}
