import React, { FunctionComponent } from 'react'
import dynamic from 'next/dynamic'

import { useHome } from './useHome'
import { resolveImage } from '../../lib/resolveImage'

import DocumentMetadata from '../DocumentMetadata'
import Link from '../Link'
import HomeTemplate from '@pmet-public/luma-ui/dist/templates/Home'

const Error = dynamic(() => import('../Error'))
const PageBuilder = dynamic(() => import('../PageBuilder'))

type HomeProps = {}

export const Home: FunctionComponent<HomeProps> = ({}) => {
    const { loading, error, data, online, refetch } = useHome()

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500" button={{ text: 'Try again', onClick: refetch }} />

    if (!loading && !data.page) return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />

    const { page, categories, storeConfig } = data

    return (
        <React.Fragment>
            {page && (
                <DocumentMetadata
                    title={page.metaTitle || page.title}
                    description={page.metaDescription}
                    keywords={page.metaKeywords}
                />
            )}

            <HomeTemplate
                loading={loading && !page}
                stories={{
                    loading: loading && !categories,
                    items: categories?.children?.map(({ id, text, href, image }: any) => ({
                        as: Link,
                        urlResolver: {
                            type: 'CATEGORY',
                            id,
                        },
                        href,
                        image: image &&
                            storeConfig?.baseMediaUrl && {
                                alt: text,
                                src: resolveImage(`${storeConfig.baseMediaUrl}catalog/category/${image}`, {
                                    width: 150,
                                }),
                            },
                        text,
                    })),
                }}
            >
                {page?.content && <PageBuilder html={page.content} />}
            </HomeTemplate>
        </React.Fragment>
    )
}
