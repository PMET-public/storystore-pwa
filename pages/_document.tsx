import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class extends Document {
    static async getInitialProps(ctx: any) {
        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage

        try {
            ctx.renderPage = () => {
                return originalRenderPage({
                    enhanceApp: (App: any) => (props: any) => sheet.collectStyles(<App {...props} />),
                })
            }

            const initialProps = await Document.getInitialProps(ctx)
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            }
        } finally {
            sheet.seal()
        }
    }

    render() {
        const {
            NODE_ENV,
            MAGENTO_URL,
            CONTENT_HOME_PAGE_ID,
            CONTENT_PARENT_CATEGORIES_ID,
            CONTENT_FOOTER_BLOCK_ID,
        } = process.env

        return (
            <html lang="en">
                <Head>
                    <noscript>Enable javascript to run this web app.</noscript>

                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, minimum-scale=1, viewport-fit=cover" />
                    <meta name="theme-color" content="#222222" />
                    <link rel="shortcut icon" href="/favicon.ico" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                    <meta name="apple-mobile-web-app-title" content="Luma" />

                    <link
                        rel="apple-touch-icon"
                        href="https://luma-pwa.fnhipster.now.sh/static/icons/apple-touch-icon.png"
                    />

                    {/* Web App Manifest  */}
                    <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

                    {/* Fonts */}

                    <link href="https://use.typekit.net" rel="preconnect" crossOrigin="true" />
                    <link rel="stylesheet" href="/static/fonts.css" />
                </Head>

                <body>
                    {/* Global Variables needed for the front-end */}
                    <div
                        dangerouslySetInnerHTML={{
                            __html: `
                                <script>
                                    window.DEVELOPMENT = ${NODE_ENV !== 'production'}
                                    window.MAGENTO_URL = '${MAGENTO_URL}';
                                    window.CONTENT_HOME_PAGE_ID = '${CONTENT_HOME_PAGE_ID}';
                                    window.CONTENT_PARENT_CATEGORIES_ID = '${CONTENT_PARENT_CATEGORIES_ID}';
                                    window.CONTENT_FOOTER_BLOCK_ID = '${CONTENT_FOOTER_BLOCK_ID}';
                                </script>
                            `,
                        }}
                    />
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
