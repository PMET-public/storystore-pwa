import React, { FunctionComponent } from 'react'
import Head from 'next/head'

export type DocumentMetadataProps = {
    title?: string | string[]
    description?: string
    keywords?: string
}

export const getFullPageTitle = (arr: string[]) => arr.filter(x => !!x).join(' | ')

export const DocumentMetadata: FunctionComponent<DocumentMetadataProps> = ({ title, description, keywords }) => {
    return (
        <Head>
            {title && <title>{typeof title === 'string' ? title : getFullPageTitle(title)}</title>}
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
        </Head>
    )
}
