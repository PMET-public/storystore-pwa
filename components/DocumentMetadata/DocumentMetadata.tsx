import Head from 'next/head'

export type DocumentMetadataProps = {
   title?: string
   description?: string
   keywords?: string
}

const DocumentMetadata = ({ title, description, keywords }: DocumentMetadataProps) => (
    <Head>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
    </Head>
)

export default DocumentMetadata
