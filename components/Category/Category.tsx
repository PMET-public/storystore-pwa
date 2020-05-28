import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'

import { Root, TopBar, TopBarWrapper, Heading, Title, BackButton, BackIcon, TopBarFilterButton, FiltersIcon } from './Category.styled'

import { useCategory } from './useCategory'
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
    const category = useCategory({ id })

    const products = useProducts({ filters: { category_id: { eq: id.toString() } } })

    const online = useNetworkStatus()

    if (!online && !category.queries.category.data?.page) return <Error type="Offline" fullScreen />

    if (!category.queries.category.loading && !category.queries.category.data?.page) {
        return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />
    }

    const page = category.queries.category.data?.page && category.queries.category.data.page[0]

    const categoryUrlSuffix = category.queries.category.data?.store?.categoryUrlSuffix ?? ''

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
                                        {!page?.title && category.queries.category.loading ? <TitleSkeleton /> : page.title}
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

                                <TopBarFilterButton as="button" type="button" onClick={products.api.togglePanel}>
                                    <span>
                                        <Icon svg={FiltersIcon} aria-label="Filters" count={products.data?.filters.count} />
                                    </span>
                                </TopBarFilterButton>
                            </TopBarWrapper>
                        </TopBar>

                        <Products {...products} />
                    </React.Fragment>
                )}
            </Root>
        </React.Fragment>
    )
}
