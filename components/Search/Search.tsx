import React, { FunctionComponent, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

import { useSearch } from './useSearch'
import { useScroll } from '@pmet-public/luma-ui/dist/hooks/useScroll'
import { useResize } from '@pmet-public/luma-ui/dist/hooks/useResize'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { resolveImage } from '../../lib/resolveImage'

import CategoryTemplate from '@pmet-public/luma-ui/dist/templates/Category'
import Link from '../Link'

import { useRouter } from 'next/router'
import Head from '../Head'

const Error = dynamic(() => import('../Error'))

type SearchProps = {}

// type FilterValues = {
//     [key: string]: {
//         eq: string
//     }
// }

export const Search: FunctionComponent<SearchProps> = () => {
    const history = useRouter()

    const { query = '' } = history.query

    const { data, loading, fetchMore, api } = useSearch({ queryString: query?.toString() })

    const { scrollY, scrollHeight } = useScroll()

    const { height } = useResize()

    const { products } = data

    /**
     * Infinite Scroll Effect
     */
    useEffect(() => {
        if (loading) return

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
            }).catch(() => {})
        }
    }, [scrollY, products, fetchMore, height, loading, scrollHeight])

    const getProductCount = useCallback(() => {
        if (!products) return
        const { count = 0 } = products
        return `${count > 999 ? '+999' : count} ${count === 0 || count > 1 ? 'results' : 'result'}`
    }, [products])

    const getNotResult = useCallback(() => {
        if (query && products?.count === 0) {
            return (
                <Error type="404">
                    We couldn’t find any results for "{query}". <br />
                    Please try the field above to search again.
                </Error>
            )
        } else {
            return null
        }
    }, [query, products])

    const online = useNetworkStatus()

    if (!online && !products) return <Error type="Offline" />

    return (
        <React.Fragment>
            <Head title="Search" />

            <CategoryTemplate
                loading={loading}
                loadingMore={loading}
                search={{
                    searchBar: {
                        label: 'Search',
                        count: getProductCount(),
                        value: query.toString(),
                        onUpdate: api.search,
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
