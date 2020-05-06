import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root, Stories } from './Home.styled'

import { useHome } from './useHome'
import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { useStoryStore } from '~/hooks/useStoryStore/useStoryStore'
import { resolveImage } from '~/lib/resolveImage'

import Link from '~/components/Link'
import Head from '~/components/Head'
import { HomeSkeleton } from './Home.skeleton'
import BubbleCarousel from '@storystore/ui/dist/components/BubbleCarousel'

const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'), { ssr: false })

type HomeProps = {}

export const Home: FunctionComponent<HomeProps> = () => {
    const {
        settings: { homePageId: id },
    } = useStoryStore()

    const { queries } = useHome({ id })

    const online = useNetworkStatus()

    if (!online && !queries.home.data?.page) return <Error type="Offline" />

    const { page, categories, storeConfig } = queries.home.data || {}

    const categoryUrlSuffix = storeConfig?.categoryUrlSuffix ?? ''

    return (
        <React.Fragment>
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>
                {categories && (
                    <Stories>
                        <BubbleCarousel
                            loading={queries.home.loading && !categories}
                            items={
                                categories[0]?.children?.map(({ id, text, href, image }: any) => ({
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
                                })) ?? []
                            }
                        />
                    </Stories>
                )}

                {queries.home.loading && !page ? (
                    <HomeSkeleton />
                ) : !queries.home.loading && !page ? (
                    <Error type="500" style={{ height: 'calc(100vh - 30rem)' }}>
                        Missing Home Page
                    </Error>
                ) : (
                    page?.content && <PageBuilder html={page.content} />
                )}
            </Root>
        </React.Fragment>
    )
}
