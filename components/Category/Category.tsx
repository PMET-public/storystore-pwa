import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'

import { Root, TopBar, TopBarWrapper, Heading, Title, TopBarFilterButton, FiltersIcon } from './Category.styled'

import { CategoryProps } from './useCategory'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'

import Link from '~/components/Link'
import Head from '~/components/Head'
import Products, { useProducts } from '~/components/Products'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import Pills from '@storystore/ui/dist/components/Pills'
import { Skeleton } from '@storystore/ui/dist/components/Skeleton'
import Icon from '@storystore/ui/dist/components/Icon'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'), { ssr: false })

const TitleSkeleton = ({ ...props }) => {
    return (
        <Skeleton height={16} width={200} {...props}>
            <rect x="0" y="0" width="200" height="16" />
        </Skeleton>
    )
}

export const Category: FunctionComponent<CategoryProps & { id: number }> = ({ id, loading, data }) => {
    const products = useProducts({ filters: { category_id: { eq: id.toString() } } })

    const online = useNetworkStatus()

    if (!online && !data?.page) return <Error type="Offline" fullScreen />

    if (!loading && !data?.page) {
        return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />
    }

    const page = data?.page && data.page[0]

    const categoryUrlSuffix = data?.store?.categoryUrlSuffix ?? ''

    const mode = page?.mode || 'PRODUCTS'

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

                                {products.data?.filters && (
                                    <TopBarFilterButton as="button" type="button" onClick={products.api.togglePanel}>
                                        <span>
                                            <Icon svg={FiltersIcon} aria-label="Filters" count={products.data?.filters.count} />
                                        </span>
                                    </TopBarFilterButton>
                                )}
                            </TopBarWrapper>
                        </TopBar>

                        <Products
                            {...{
                                ...products,
                                data: {
                                    ...products.data,
                                    sorting:
                                        /**
                                         * Filter Sort By Options for those provided by the User on the Category level.
                                         * GraphQL Query is returning empty if the user selects the default [] Use All
                                         */
                                        page?.availableSortBy.length > 0 && products.data
                                            ? {
                                                  ...products.data.sorting,
                                                  default: page.defaultSortBy,
                                                  defaultValues: { sortBy: page.defaultSortBy + ',DESC' },
                                                  options: products.data.sorting?.options?.filter((x: any) => {
                                                      return page.availableSortBy.findIndex((y: string) => y === x.value) > -1
                                                  }),
                                              }
                                            : products.data?.sorting,
                                },
                            }}
                        />
                    </React.Fragment>
                )}
            </Root>
        </React.Fragment>
    )
}
