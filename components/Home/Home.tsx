import React, { FunctionComponent } from 'react'
import { useHome } from './useHome'

import DocumentMetadata from '../DocumentMetadata'
import Error from '../Error'
import HomeTemplate from '@pmet-public/luma-ui/dist/templates/Home'
import ViewLoader from '@pmet-public/luma-ui/dist/components/ViewLoader'
import Link from '../Link'
import { resolveImage } from '../../lib/resolveImage'
import PageBuilder from '../PageBuilder'

type HomeProps = {}

export const Home: FunctionComponent<HomeProps> = ({}) => {
    const { loading, error, data, online, refetch } = useHome()

    if (!data) return null

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500" button={{ text: 'Try again', onClick: refetch }} />

    if (!data.page && loading) return <ViewLoader />

    if (!data.page) return <Error type="404" button={{ text: 'Search', as: Link, href: '/search' }} />

    const { page, categories, storeConfig } = data

    return (
        <React.Fragment>
            <DocumentMetadata
                title={page.metaTitle || page.title}
                description={page.metaDescription}
                keywords={page.metaKeywords}
            />

            <HomeTemplate
                stories={{
                    items: categories.children.map(({ id, text, href, image }: any) => ({
                        as: Link,
                        urlResolver: {
                            type: 'CATEGORY',
                            id,
                        },
                        href,
                        image: {
                            alt: text,
                            src:
                                image &&
                                resolveImage(`${storeConfig.baseMediaUrl}catalog/category/${image}`, {
                                    width: 150,
                                }),
                        },
                        text,
                    })),
                }}
            >
                <PageBuilder html={page.content} />
            </HomeTemplate>
        </React.Fragment>
    )
}
