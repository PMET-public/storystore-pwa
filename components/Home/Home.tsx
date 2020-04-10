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
}

export const Home: FunctionComponent<HomeProps> = ({ id }) => {
    const { queries } = useHome({ id })

    const online = useNetworkStatus()

    if (!online && !queries.home.data.page) return <Error type="Offline" />

    const { page, categories, storeConfig } = queries.home.data || {}

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
                loading={queries.home.loading && !page}
                stories={{
                    loading: queries.home.loading && !categories,
                    items: categories
                        ? categories[0].children.map(({ id, text, href, image }: any) => ({
                              as: Link,
                              urlResolver: {
                                  type: 'CATEGORY',
                                  id,
                              },
                              href: href + categoryUrlSuffix,
                              image: image && {
                                  alt: text,
                                  src: resolveImage(image, { width: 200, height: 200 }),
                                  width: '100px',
                                  height: '100px',
                              },
                              text,
                          }))
                        : [],
                }}
            >
                {!queries.home.loading && !page ? (
                    <Error type="500" style={{ height: 'calc(100vh - 30rem)' }}>
                        Missing Home Page
                    </Error>
                ) : (
                    page?.content && <PageBuilder html={page.content} />
                )}
            </HomeTemplate>
        </React.Fragment>
    )
}
