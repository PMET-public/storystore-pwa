import React, { FunctionComponent, useState, useEffect } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'
import { useScroll } from 'luma-ui/dist/hooks/useScroll'
import { useResize } from 'luma-ui/dist/hooks/useResize'

import Router from 'next/router'
import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import CategoryTemplate from 'luma-ui/dist/templates/Category'
import Link from '../Link'

type SearchProps = {
    query?: string
}

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

const PRODUCTS_QUERY = gql`
    query searchQuery($search: String, $filters: ProductFilterInput, $pageSize: Int = 10, $currentPage: Int = 1) {
        store: storeConfig {
            id
            titlePrefix: title_prefix
            titleSuffix: title_suffix
        }

        meta: storeConfig {
            id
            titlePrefix: title_prefix
            titleSuffix: title_suffix
            description: default_description
            keywords: default_keywords
        }

        products: products(search: $search, filter: $filters, pageSize: $pageSize, currentPage: $currentPage) {
            pagination: page_info {
                current: current_page
                total: total_pages
            }
            filters {
                name
                key: request_var
                items: filter_items {
                    count: items_count
                    label
                    value: value_string
                }
            }
            count: total_count
            items @connection(key: "items") {
                id
                image {
                    alt: label
                    src: url
                }
                price {
                    regularPrice {
                        amount {
                            currency
                            value
                        }
                    }
                }
                title: name
                urls: url_rewrites {
                    url
                }
            }
        }
    }
`

export const Search: FunctionComponent<SearchProps> = ({ query = '' }) => {
    const { scrollY, scrollHeight } = useScroll()

    const { height } = useResize()

    const [search, setSearch] = useState(query)

    const [filters, setFilters] = useState<FilterValues>({})

    const searchQuery = useQuery(PRODUCTS_QUERY, {
        variables: { search: search || undefined, filters }, // undefined to patch a serverside graphql bug
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
    })

    /**
     * Infinite Scroll Effect
     */
    useEffect(() => {
        if (searchQuery.loading) return

        const { products } = searchQuery.data

        // ignore if it is loading or has no pagination
        if (!products.pagination) return

        // don't run if it's in the last page
        if (!(products.pagination.current < products.pagination.total)) return

        // load more products when the scroll reach half of the viewport height
        if (scrollY + height > scrollHeight / 2) {
            searchQuery.fetchMore({
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

    if (searchQuery.error) {
        console.error(searchQuery.error.message)
        return <Error statusCode={500} />
    }

    const { products, store, meta } = searchQuery.data || {}

    const getProductCount = () => {
        if (!products) return
        const { count = 0 } = products
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }

    const getNotResult = () => {
        if (search && products && products.count === 0) return `We couldn’t find anything for "${search}".`
    }

    function handleOnNewSearch(newQuery: string) {
        if (newQuery.length === 0 || newQuery.length > 2) {
            setSearch(newQuery)
            setFilters({})
            window.scrollTo(0, 0)
        }
    }

    function handleOnClickFilterValue(key: string, value: string) {
        setFilters({
            ...filters,
            [key]: {
                eq: value,
            },
        })
    }

    return (
        <React.Fragment>
            {store && meta && (
                <DocumentMetadata
                    title={[store.titlePrefix, 'Search', store.titleSuffix]}
                    description={meta.description}
                    keywords={meta.keywords}
                />
            )}

            <CategoryTemplate
                search={{
                    searchBar: {
                        label: 'Search',
                        count: getProductCount(),
                        loader: searchQuery.loading ? { label: 'loading' } : undefined,
                        value: search,
                        onUpdate: handleOnNewSearch,
                    },
                    noResult: getNotResult(),
                }}
                filters={{
                    label: 'Filters',
                    closeButton: {
                        text: 'Done',
                    },
                    groups:
                        products &&
                        products.filters &&
                        products.filters.map(({ name, key, items }: any) => ({
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
                }}
                products={{
                    loader: searchQuery.loading && products && { label: 'fetching products ' },
                    items:
                        products &&
                        products.items.map(({ id, image, price, title, urls }: any, index: number) => ({
                            as: (props: any) => <Link urlResolver href={urls[urls.length - 1].url} {...props} />,
                            _id: `${id}--${index}`,
                            image,
                            price: {
                                regular: price.regularPrice.amount.value,
                                currency: price.regularPrice.amount.currency,
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
