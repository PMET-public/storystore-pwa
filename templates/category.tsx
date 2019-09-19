import React, { FunctionComponent, useState, useEffect } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'
import { useScroll } from 'luma-ui/dist/hooks/useScroll'
import { useResize } from 'luma-ui/dist/hooks/useResize'

import DocumentMetadata from '../components/DocumentMetadata'
import { LinkResolver } from '../components/Link'
import CategoryTemplate from 'luma-ui/dist/templates/Category'
import Error from 'next/error'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'

type CategoryProps = {
    id: number
}

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

const CATEGORY_QUERY = gql`
    query CategoryQuery($id: Int!) {
        page: category(id: $id) {
            id
            title: name
            breadcrumbs {
                _id: category_url_key
                text: category_name
                href: category_url_key
            }
            categories: children {
                _id: url_key
                text: name
                count: product_count
                href: url_path
            }
        }

        meta: category(id: $id) {
            id
            description: meta_description
            keywords: meta_keywords
            title: meta_title
        }

        store: storeConfig {
            id
            titlePrefix: title_prefix
            titleSuffix: title_suffix
        }
    }
`

const PRODUCTS_QUERY = gql`
    query ProductsQuery($filters: ProductFilterInput!, $pageSize: Int = 10, $currentPage: Int = 1) {
        products: products(filter: $filters, pageSize: $pageSize, currentPage: $currentPage) {
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
            items {
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
            }
        }
    }
`

const Category: FunctionComponent<CategoryProps> = ({ id }) => {
    const { scrollY, scrollHeight } = useScroll()

    const { height } = useResize()

    const [filterValues, setFilterValues] = useState<FilterValues>({
        category_id: {
            eq: id.toString(),
        },
    })

    const categoryQuery = useQuery(CATEGORY_QUERY, {
        variables: { id },
        fetchPolicy: 'cache-first',
    })

    const productsQuery = useQuery(PRODUCTS_QUERY, {
        variables: { filters: filterValues },
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
    })

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

    if (categoryQuery.loading) {
        return <ViewLoader />
    }

    if (categoryQuery.error) {
        console.error(categoryQuery.error.message)
        return <Error statusCode={500} />
    }

    if (!categoryQuery.data.page) {
        return <Error statusCode={404} />
    }

    const { store, meta, page } = categoryQuery.data

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
            <DocumentMetadata
                title={[store.titlePrefix, meta.title || page.title, store.titleSuffix]}
                description={meta.description}
                keywords={meta.keywords}
            />

            <CategoryTemplate
                title={{
                    as: 'h2',
                    text: page.title,
                }}
                breadcrumbs={
                    page.breadcrumbs && {
                        items: page.breadcrumbs.map(({ _id, text, href }: any) => ({
                            _id,
                            as: LinkResolver,
                            href: '/' + href,
                            text,
                        })),
                    }
                }
                categories={
                    page.categories && {
                        items: page.categories.map(({ _id, text, count, href }: any) => ({
                            _id,
                            as: LinkResolver,
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
                    items:
                        products &&
                        products.items.map(({ id, image, price, title }: any, index: number) => ({
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
export default Category
