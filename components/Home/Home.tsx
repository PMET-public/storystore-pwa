import React, { FunctionComponent } from 'react'
import { useHome } from './useHome'

import DocumentMetadata from '../DocumentMetadata'
import Error from '../Error'
import HomeTemplate from 'luma-ui/dist/templates/Home'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import Link from '../Link'

type HomeProps = {}

export const Home: FunctionComponent<HomeProps> = ({}) => {
    const { loading, error, data, online } = useHome()

    if (!data) return null

    if (error && !online) return <Error type="Offline" />

    if (error) return <Error type="500">{error.message}</Error>

    if (!data.page && loading) return <ViewLoader />

    if (!data.page) return <Error type="404" />

    const { page, categories } = data

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
                        img: {
                            alt: text,
                            src: image,
                        },
                        text,
                    })),
                }}
                pageBuilder={{
                    html: page.content,
                }}
            />
        </React.Fragment>
    )
}
