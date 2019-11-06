import React, { FunctionComponent } from 'react'
import { useHome } from './useHome'

import DocumentMetadata from '../DocumentMetadata'
import Error from 'next/error'
import HomeTemplate from 'luma-ui/dist/templates/Home'
import ViewLoader from 'luma-ui/dist/components/ViewLoader'
import Link from '../Link'

type HomeProps = {
    id: number
    categoryId: number
}

export const Home: FunctionComponent<HomeProps> = ({ id, categoryId }) => {
    const { loading, error, data } = useHome({ id, categoryId })

    if (loading) {
        return <ViewLoader />
    }

    if (error) {
        console.error(error.message)
        return <Error statusCode={500} />
    }

    if (!data.page) {
        return <Error statusCode={404} />
    }

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
                    items: categories.children.map(({ text, href, image }: any) => ({
                        as: Link,
                        urlResolver: true,
                        href,
                        img: {
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
