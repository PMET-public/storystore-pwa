
import React, { FunctionComponent } from 'react';
import Head from 'next/head'

export type DocumentMetadataProps = {
   title?: string
   description?: string
   keywords?: string
}

const DocumentMetadata: FunctionComponent<DocumentMetadataProps> = ({ title, description, keywords }) => (
    <Head>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
    </Head>
)

export default DocumentMetadata
