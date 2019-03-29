import Head from 'next/head'

const DocumentMetadata = ({ title = null, description = null, keywords = null }) => (
    <Head>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
    </Head>
)

export default DocumentMetadata
