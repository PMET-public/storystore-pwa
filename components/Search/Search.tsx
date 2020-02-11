import React, { FunctionComponent, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

import SEARCH_QUERY from './graphql/search.graphql'

import { useQuery } from '@apollo/react-hooks'
import { useScroll } from '@pmet-public/luma-ui/dist/hooks/useScroll'
import { useResize } from '@pmet-public/luma-ui/dist/hooks/useResize'
import { useAppContext } from '@pmet-public/luma-ui/dist/AppProvider'
import useValueUpdated from '../../hooks/useValueUpdated'
import { resolveImage } from '../../lib/resolveImage'

import Router from 'next/router'
import DocumentMetadata from '../DocumentMetadata'
import CategoryTemplate from '@pmet-public/luma-ui/dist/templates/Category'
import Link from '../Link'

const Error = dynamic(() => import('../Error'))

type SearchProps = {
    query?: string
}

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

export const Search: FunctionComponent<SearchProps> = ({ query = '' }) => {
    const { scrollY, scrollHeight } = useScroll()

    const { height } = useResize()

    const [search, setSearch] = useState(query)

    const [filters, setFilters] = useState<FilterValues>({})

    const { loading, error, data, refetch, fetchMore } = useQuery(SEARCH_QUERY, {
        variables: { search, filters },
        returnPartialData: true,
        fetchPolicy: 'cache-and-network',
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
     * Infinite Scroll Effect
     */
    useEffect(() => {
        if (loading) return

        const { products } = data

        // ignore if it is loading or has no pagination
        if (!products.pagination) return

        // don't run if it's in the last page
        if (!(products.pagination.current < products.pagination.total)) return

        // load more products when the scroll reach half of the viewport height
        if (scrollY + height > scrollHeight / 2) {
            fetchMore({
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

    /**
     * Update query URL
     */
    useEffect(() => {
        Router.push(`/search?query=${search}`, `/search?query=${search}`, { shallow: true })
    }, [search])

    if (error && !online) return <Error type="Offline" />

    if (error)
        return (
            <Error type="500" button={{ text: 'Try again', onClick: () => refetch() }}>
                {error.message}
            </Error>
        )

    const { products, store, meta } = data

    const getProductCount = useCallback(() => {
        if (!products) return
        const { count = 0 } = products
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }, [products])

    const getNotResult = useCallback(() => {
        if (search && products?.count === 0) {
            return (
                <Error type="404">
                    We couldn’t find any results for "{search}". <br />
                    Please try the field above to search again.
                </Error>
            )
        } else {
            return null
        }
    }, [search, products?.count])

    const handleOnNewSearch = useCallback(
        (newQuery: string) => {
            if (newQuery.length === 0 || newQuery.length > 2) {
                setSearch(newQuery)
                window.scrollTo(0, 0)
            }
        },
        [setSearch, setFilters]
    )

    // function handleOnClickFilterValue(key: string, value: string) {
    //     setFilters({
    //         ...filters,
    //         [key]: {
    //             eq: value,
    //         },
    //     })
    // }

    return (
        <React.Fragment>
            {store && meta && <DocumentMetadata />}

            <CategoryTemplate
                loading={loading}
                loadingMore={loading}
                search={{
                    searchBar: {
                        label: 'Search',
                        count: getProductCount(),
                        value: search,
                        onUpdate: handleOnNewSearch,
                    },
                    noResult: getNotResult(),
                }}
                // filters={{
                //     label: 'Filters',
                //     closeButton: {
                //         text: 'Done',
                //     },
                //     groups:
                //         products?.filters?.map(({ name, key, items }: any) => ({
                //             title: name,
                //             items: items.map(({ label, count, value }: any) => ({
                //                 as: 'a',
                //                 count,
                //                 href: '#',
                //                 text: label,
                //                 onClick: (e: Event) => {
                //                     e.preventDefault()
                //                     handleOnClickFilterValue(key, value)
                //                 },
                //             })),
                //         })),
                // }}
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
            />
        </React.Fragment>
    )
}
