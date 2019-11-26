import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class extends Document {
    static async getInitialProps(ctx: any) {
        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App: any) => (props: any) => sheet.collectStyles(<App {...props} />),
                })

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
        return (
            <html lang="en">
                <Head>
                    <noscript>Enable javascript to run this web app.</noscript>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, viewport-fit=contain"
                    />
                    <meta name=" theme-color" content="#222222" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_512x512.png"
                        sizes="512x512"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_384x384.png"
                        sizes="384x384"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_256x256.png"
                        sizes="256x256"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_192x192.png"
                        sizes="192x192"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_180x180.png"
                        sizes="180x180"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_167x167.png"
                        sizes="167x167"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_152x152.png"
                        sizes="152x152"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_128x128.png"
                        sizes="128x128"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_120x120.png"
                        sizes="120x120"
                        crossOrigin="use-credentials"
                    />
                    <link
                        rel="apple-touch-icon"
                        href="/static/icons/icon_96x96.png"
                        sizes="96x96"
                        crossOrigin="use-credentials"
                    />

                    {/* Fonts */}
                    <link rel="stylesheet" href="/static/fonts.css" crossOrigin="use-credentials" />

                    <link rel="icon" href="/static/favicon.ico" crossOrigin="use-credentials" />

                    {/* Web App Manifest  */}
                    <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
                </Head>
                <body className="custom_class">
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
