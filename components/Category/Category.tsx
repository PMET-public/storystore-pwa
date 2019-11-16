import React, { FunctionComponent, useState, useEffect } from 'react'
import CATEGORY_QUERY from './category.graphql'
import PRODUCTS_QUERY from './products.graphql'

import { useQuery } from '@apollo/react-hooks'
import { useScroll } from 'luma-ui/dist/hooks/useScroll'
import { useResize } from 'luma-ui/dist/hooks/useResize'
import useValueUpdated from '../../hooks/useValueUpdated'

import DocumentMetadata from '../DocumentMetadata'
import Link from '../Link'
import CategoryTemplate from 'luma-ui/dist/templates/Category'
import Error from '../Error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import { useAppContext } from 'luma-ui/dist/AppProvider'
import { resolveImage } from '../../lib/resolveImage'

type CategoryProps = {
    id: number
}

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

export const Category: FunctionComponent<CategoryProps> = ({ id }) => {
    const { scrollY, scrollHeight } = useScroll()

    const { height } = useResize()

    const [filterValues, setFilterValues] = useState<FilterValues>({
        category_id: {
            eq: id.toString(),
        },
    })

    const { loading, error, data, refetch } = useQuery(CATEGORY_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
    })

    const productsQuery = useQuery(PRODUCTS_QUERY, {
        variables: { filters: filterValues },
        fetchPolicy: 'cache-and-network',
        returnPartialData: true,
    })

    /**
     * Refetch when back online
     */
    const {
        state: { online },
    } = useAppContext()

    useValueUpdated(() => {
        if (error && online) refetch()
    }, online)

    /**
     * Update filters on ID change
     */
    useEffect(() => {
        setFilterValues({
            category_id: {
                eq: id.toString(),
            },
        })
    }, [id])

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
            productsQuery.fetchMore({
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
        }
    }, [scrollY])

    if (!data) return null

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500">{error.message}</Error>

    if (!data.page && loading) return <ViewLoader />

    if (!data.page) return <Error type="404" />

    const { page } = data

    const products = productsQuery.data && productsQuery.data.products

    function handleOnClickFilterValue(key: string, value: string) {
        setFilterValues({
            ...filterValues,
            [key]: {
                eq: value,
            },
        })
    }

    return (
        <React.Fragment>
            <DocumentMetadata />

            <CategoryTemplate
                display={page.mode}
                title={{
                    as: 'h2',
                    text: page.title,
                }}
                breadcrumbs={
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
                    page.categories && {
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
                    products &&
                    products.filters && {
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
                                    handleOnClickFilterValue(key, value)
                                },
                            })),
                        })),
                    }
                }
                products={{
                    loading: productsQuery.loading ? 10 : 0,
                    items:
                        products &&
                        products.items.map(({ id, image, price, title, urlKey }: any, index: number) => ({
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
                                    desktop: resolveImage(image.src, { width: 1000 }),
                                    mobile: resolveImage(image.src, { width: 600 }),
                                },
                            },
                            price: {
                                regular: price.regularPrice.amount.value,
                                currency: price.regularPrice.amount.currency,
                            },
                            title: {
                                text: title,
                            },
                        })),
                }}
            >
                {page.cmsBlock}
            </CategoryTemplate>
        </React.Fragment>
    )
}
