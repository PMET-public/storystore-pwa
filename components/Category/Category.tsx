import React, { FunctionComponent, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Root, HeadingWrapper, Heading, Title, TopBarFilterToggleButton } from './Category.styled'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import Link from '~/components/Link'
import Head from '~/components/Head'
import Breadcrumbs from '@storystore/ui/dist/components/Breadcrumbs'
import Pills from '@storystore/ui/dist/components/Pills'
import { Skeleton } from '@storystore/ui/dist/components/Skeleton'
import TopBar from '@storystore/ui/dist/components/TopBar'
import FiltersIcon from 'remixicon/icons/System/list-settings-line.svg'
import FiltersCloseIcon from 'remixicon/icons/System/list-settings-fill.svg'
import { QueryResult, useQuery } from '@apollo/client'
import Products, { PRODUCTS_QUERY } from '~/components/Products'
import Icon from '@storystore/ui/dist/components/Icon'
import Sidebar from '@storystore/ui/dist/components/Sidebar'
import { Filters, FilterVariables, FilterSelected } from '~/components/Filters'

const Error = dynamic(() => import('../Error'))

const PageBuilder = dynamic(() => import('../PageBuilder'), { ssr: false })

const TitleSkeleton = ({ ...props }) => {
    return (
        <Skeleton height={16} width={200} {...props}>
            <rect x="0" y="0" width="200" height="16" />
        </Skeleton>
    )
}

export const Category: FunctionComponent<QueryResult> = ({ loading, data }) => {
    const [panelOpen, setPanelOpen] = useState(false)

    const [filters, setFilters] = useState<{ selected: FilterSelected; variables: FilterVariables }>({ selected: {}, variables: {} })

    const categoryUrlSuffix = data?.storeConfig.categoryUrlSuffix

    const page = data?.categoryList && data.categoryList[0]

    const mode = page?.mode || 'PRODUCTS'

    const online = useNetworkStatus()

    const products = useQuery(PRODUCTS_QUERY, {
        variables: { filters: { category_id: { eq: page.id }, ...filters.variables } },
    })

    const handleOnFiltersUpdate = useCallback(({ selected, variables }) => {
        setFilters({ selected, variables })
    }, [])

    if (!online && !data?.categoryList) return <Error type="Offline" fullScreen />

    if (!loading && !data?.categoryList) {
        return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />
    }

    return (
        <React.Fragment key={`category--${mode}--${page?.id}`}>
            {/* Head Metadata */}
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>
                {/* PageBuilder Content */}
                {(mode === 'PRODUCTS_AND_PAGE' || mode === 'PAGE') && <PageBuilder html={page?.block?.content || page?.description} />}

                {/* Product List */}
                {page?.id && (mode === 'PRODUCTS_AND_PAGE' || mode === 'PRODUCTS') && (
                    <React.Fragment>
                        <TopBar sticky>
                            <HeadingWrapper>
                                <Heading>
                                    <Title>{!page.title && loading ? <TitleSkeleton /> : page.title}</Title>

                                    {/* Sub-Categories */}
                                    {page.categories?.length > 0 && (
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

                                    {/* Breadcrumbs */}
                                    {page.categories?.length === 0 && page.breadcrumbs && (
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
                                </Heading>
                            </HeadingWrapper>

                            <TopBarFilterToggleButton onClick={() => setPanelOpen(!panelOpen)}>
                                <Icon svg={panelOpen ? FiltersCloseIcon : FiltersIcon} aria-label="Filters" attention={Object.keys(filters.selected).length > 0} />
                            </TopBarFilterToggleButton>
                        </TopBar>

                        <Products {...products} />

                        <Sidebar position="right" onClose={() => setPanelOpen(false)} button={{ text: 'Done', onClick: () => setPanelOpen(false) }}>
                            {panelOpen && <Filters {...products} defaultSelected={{ ...filters.selected }} onUpdate={handleOnFiltersUpdate} />}
                        </Sidebar>
                    </React.Fragment>
                )}
            </Root>
        </React.Fragment>
    )
}
