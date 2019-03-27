import Document, { Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'

export default class extends Document {
    static getInitialProps({ renderPage }) {
        const { html, head, errorHtml, chunks } = renderPage()
        const styles = flush()
        return { html, head, errorHtml, chunks, styles }
    }

    render() {
        return (
            <html lang="en">
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="theme-color" content="#FFFFFF" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/_next/static/images/icon_180x180.png'" />
                    <link rel="icon" href="/static/favicon.ico" />
                    <link rel="manifest" href="/_next/static/manifest.json" crossOrigin="use-credentials" />
                    <link rel="preconnect" href="{process.env.MAGENTO_BACKEND_URL}" />
                </Head>
                <body className="custom_class">
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}