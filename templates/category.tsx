import React, { FunctionComponent, useState, useEffect } from 'react'
import gql from 'graphql-tag'

import { useQuery } from '@apollo/react-hooks'

import DocumentMetadata from '../components/DocumentMetadata'
import ProductList from 'luma-storybook/dist/templates/ProductList'
import Error from 'next/error'
import ViewLoader from 'luma-storybook/dist/components/ViewLoader'
import Link from '../components/Link'

type CategoryProps = {
    id: number
}

type FilterValues = {
    [key: string]: {
        eq: string
    }
}

const QUERY = gql`
    query CategoryQuery(
        $id: Int!, 
        $filters: ProductFilterInput!
        $pageSize: Int = 20,
        $currentPage: Int = 1
    ) {
        page: category(id: $id) {
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

        products: products(filter: $filters, pageSize: $pageSize, currentPage: $currentPage) {
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
                _id: id
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

        meta: category(id: $id) {
            id
            description: meta_description
            keywords: meta_keywords
            title: meta_title
        }

        store: storeConfig {
            titlePrefix:  title_prefix
            titleSuffix: title_suffix
        }
    }
`

const Category: FunctionComponent<CategoryProps> = ({ id }) => {

    const [filterValues, setFilterValues] = useState<FilterValues>({ })

    const { loading, data } = useQuery(QUERY, {
        variables: { id, filters: filterValues },
        fetchPolicy: 'cache-first',
    })

    useEffect(() => {
        setFilterValues({
            category_id: {
                eq: id.toString(),
            },
        })
    }, [id])

    if (loading) return <ViewLoader />

    if (!data.page) return <Error statusCode={404} />

    const triggerOnClickFilterValue = (key: string, value: string) => {
        setFilterValues({
            ...filterValues,
            [key]: {
                eq: value,
            },
        })
    }

    const {
        store,
        meta,
        page,
        products,
    } = data

    return (
        <React.Fragment>
            <DocumentMetadata
                title={[store.titlePrefix, (meta.title || page.title), store.titleSuffix]}
                description={meta.description}
                keywords={meta.keywords}
            />

            <ProductList
                title={{
                    as: 'h2',
                    text: page.title,
                }}
                breadcrumbs={page.breadcrumbs && {
                    items: page.breadcrumbs.map(({ _id, text, href }: any) => ({
                        _id,
                        as: Link,
                        href: '/' + href,
                        text,
                    })),
                }}
                categories={page.categories && {
                    items: page.categories.map(({ _id, text, count, href }: any) => ({
                        _id,
                        as: Link,
                        count,
                        text,
                        href: '/' + href,
                    })),
                }}
                filters={products.filters && {
                    label: 'Filters',
                    closeButton: {
                        text: 'Done',
                    },
                    props: {
                        groups: products.filters.map(({ name, key, items }: any) => ({
                            title: {
                                text: name,
                            },
                            items: items.map(({ label, count, value }: any) => ({
                                as: 'a',
                                count,
                                href: '#',
                                text: label,
                                onClick: (e: Event) => {
                                    e.preventDefault()
                                    triggerOnClickFilterValue(key, value)
                                },
                            })),
                        })),
                    },
                }}
                products={products.items && products.items.map(({
                    _id,
                    image,
                    price,
                    title,
                }: any) => ({
                    _id,
                    image,
                    price: {
                        price: price.regularPrice.amount.value.toLocaleString('en-US', {
                            style: 'currency',
                            currency: price.regularPrice.amount.currency,
                        }),
                    },
                    title: {
                        text: title,
                    },
                }))}
            />
        </React.Fragment>
    )
}
export default Category
