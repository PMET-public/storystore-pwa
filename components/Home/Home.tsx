import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'

import { useHome } from './useHome'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { resolveImage } from '../../lib/resolveImage'

import Link from '../Link'
import HomeTemplate from '@pmet-public/luma-ui/dist/templates/Home'
import Head from '../Head'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'))

type HomeProps = {
    id: string
    categoriesParentId: string
}

export const Home: FunctionComponent<HomeProps> = ({ id, categoriesParentId }) => {
    const { loading, data } = useHome({ id, categoriesParentId })

    const online = useNetworkStatus()

    if (!online && !data.page) return <Error type="Offline" />

    if (!loading && !data.page) return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />

    const { page, categories, storeConfig } = data

    const categoryUrlSuffix = storeConfig?.categoryUrlSuffix ?? ''

    return (
        <React.Fragment>
            {page && (
                <Head
                    title={page.metaTitle || page.title}
                    description={page.metaDescription}
                    keywords={page.metaKeywords}
                />
            )}

            <HomeTemplate
                loading={loading && !page}
                stories={
                    categories && {
                        loading: loading && !categories,
                        items: categories[0].children.map(({ id, text, href, image }: any) => ({
                            as: Link,
                            urlResolver: {
                                type: 'CATEGORY',
                                id,
                            },
                            href: href + categoryUrlSuffix,
                            image: image &&
                                storeConfig?.baseMediaUrl && {
                                    alt: text,
                                    src: resolveImage(image, { width: 200, height: 200 }),
                                    width: '100px',
                                    height: '100px',
                                },
                            text,
                        })),
                    }
                }
            >
                {page?.content && <PageBuilder html={page.content} />}
            </HomeTemplate>
        </React.Fragment>
    )
}
