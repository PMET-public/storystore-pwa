import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'
import { Root, Stories } from './Home.styled'
import { resolveImage } from '~/lib/resolveImage'

import { useNetworkStatus } from '~/hooks/useNetworkStatus'
import { HomeProps } from './useHome'

import { HomeSkeleton } from './Home.skeleton'
import Link from '~/components/Link'
import Head from '~/components/Head'
import BubbleCarousel from '@storystore/ui/dist/components/BubbleCarousel'

const Error = dynamic(() => import('~/components/Error'))
const PageBuilder = dynamic(() => import('~/components/PageBuilder'), { ssr: false })

export const Home: FunctionComponent<HomeProps> = ({ loading, data }) => {
    const online = useNetworkStatus()

    const { page, categories, storeConfig } = data || {}

    const categoryUrlSuffix = storeConfig?.categoryUrlSuffix ?? ''

    if (!online && !data?.page) {
        return <Error type="Offline" fullScreen />
    }

    if (!loading && !page) {
        return <Error type="404">Page not found</Error>
    }

    return (
        <React.Fragment>
            {page && <Head title={page.metaTitle || page.title} description={page.metaDescription} keywords={page.metaKeywords} />}

            <Root>
                {categories && categories[0]?.children && (
                    <Stories>
                        <BubbleCarousel
                            loading={loading && !categories}
                            items={categories[0]?.children?.map(({ id, text, href, image, mode }: any) => ({
                                as: Link,
                                urlResolver: {
                                    type: 'CATEGORY',
                                    id,
                                    mode,
                                },
                                href: href + categoryUrlSuffix,
                                image: image && {
                                    alt: text,
                                    src: resolveImage(image, { width: 200, height: 200 }),
                                    width: '100px',
                                    height: '100px',
                                },
                                text,
                            }))}
                        />
                    </Stories>
                )}

                {loading && !page ? <HomeSkeleton /> : page?.content && <PageBuilder html={page.content} />}
            </Root>
        </React.Fragment>
    )
}
