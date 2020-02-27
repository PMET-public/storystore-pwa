import React, { FunctionComponent, useEffect } from 'react'
import dynamic from 'next/dynamic'

import { useCategory } from './useCategory'
import { useScroll } from '@pmet-public/luma-ui/dist/hooks/useScroll'
import { useResize } from '@pmet-public/luma-ui/dist/hooks/useResize'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { resolveImage } from '../../lib/resolveImage'

import Link from '../Link'
import CategoryTemplate from '@pmet-public/luma-ui/dist/templates/Category'
import Head from '../Head'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'))

type CategoryProps = {
    id: number
}

export const Category: FunctionComponent<CategoryProps> = ({ id }) => {
    const { data, loading, products: productsQuery, api } = useCategory({ id })

    const { scrollY, scrollHeight } = useScroll()

    const { height } = useResize()

    /**
     * Infinite Scroll Effect
     */
    useEffect(() => {
        if (productsQuery.loading) return

        const { products } = productsQuery.data

        // ignore if it is loading or has no pagination
        if (!products.pagination) return

        // don't run if it's in the last page
        if (!(products.pagination.current < products.pagination.total)) return

        // load more products when the scroll reach half of the viewport height
        if (scrollY + height > scrollHeight / 2) {
            productsQuery
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
        }
    }, [scrollY, height, productsQuery, scrollHeight])

    const online = useNetworkStatus()

    if (!online && !data.page) return <Error type="Offline" />

    if (!loading && !data.page) return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />

    const page = data.page && data.page[0]

    const products = productsQuery.data && productsQuery.data.products

    return (
        <React.Fragment>
            {page && (
                <Head
                    title={page.metaTitle || page.title}
                    description={page.metaDescription}
                    keywords={page.metaKeywords}
                />
            )}

            <CategoryTemplate
                loading={loading && !page}
                loadingMore={productsQuery.loading}
                display={page?.mode || 'PRODUCTS_AND_PAGE'}
                title={{
                    as: 'h2',
                    text: page?.title,
                }}
                backButton={
                    page?.breadcrumbs && {
                        as: Link,
                        urlResolver: {
                            type: 'CATEGORY',
                            id: page.breadcrumbs[page.breadcrumbs.length - 1].id,
                        },
                        href: page.breadcrumbs[page.breadcrumbs.length - 1].href,
                    }
                }
                breadcrumbs={
                    page &&
                    (!page.categories || page.categories?.length === 0) &&
                    page.breadcrumbs && {
                        items: page.breadcrumbs.map(({ id, text, href }: any) => ({
                            _id: id,
                            as: Link,
                            urlResolver: {
                                type: 'CATEGORY',
                                id,
                            },
                            href: '/' + href,
                            text,
                        })),
                    }
                }
                categories={
                    page?.categories && {
                        items: page.categories.map(({ id, text, count, href }: any) => ({
                            _id: id,
                            as: Link,
                            urlResolver: {
                                type: 'CATEGORY',
                                id,
                            },
                            count,
                            text,
                            href: '/' + href,
                        })),
                    }
                }
                filters={
                    products?.filters && {
                        label: 'Filters',
                        closeButton: {
                            text: 'Done',
                        },
                        groups: products.filters.map(({ name, key, items }: any) => ({
                            title: name,
                            items: items.map(({ label, count, value }: any) => ({
                                as: 'a',
                                count,
                                href: '#',
                                text: label,
                                onClick: (e: Event) => {
                                    e.preventDefault()
                                    api.setFilter(key, value)
                                },
                            })),
                        })),
                    }
                }
                products={{
                    items: products?.items.map(({ id, image, price, title, urlKey }: any, index: number) => ({
                        _id: `${id}--${index}`,
                        as: Link,
                        href: `/${urlKey}`,
                        urlResolver: {
                            type: 'PRODUCT',
                            id,
                        },
                        image: {
                            alt: image.alt,
                            src: {
                                desktop: resolveImage(image.src),
                                mobile: resolveImage(image.src),
                            },
                        },
                        price: {
                            label:
                                price.maximum.regular.value > price.minimum.regular.value ? 'Starting at' : undefined,
                            regular: price.minimum.regular.value,
                            special:
                                price.minimum.discount.amountOff &&
                                price.minimum.final.value - price.minimum.discount.amountOff,
                            currency: price.minimum.regular.currency,
                        },
                        title: {
                            text: title,
                        },
                    })),
                }}
            >
                {page && <PageBuilder html={page.cmsBlock} />}
            </CategoryTemplate>
        </React.Fragment>
    )
}
