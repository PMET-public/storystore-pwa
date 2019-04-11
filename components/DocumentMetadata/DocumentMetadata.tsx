import Head from 'next/head'

type Props = {
   title?: string
   description?: string
   keywords?: string
}

const DocumentMetadata = ({ title, description, keywords }: Props) => (
    <Head>
        {title && <title>{title}</title>}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
    </Head>
)

export default DocumentMetadata
