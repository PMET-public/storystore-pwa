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
                    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
                    <meta name="theme-color" content="#222222" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <meta name="apple-mobile-web-app-title" content="Luma" />
                    <link rel="apple-touch-icon" href="ios-icon.png" />

                    {/* Fonts */}
                    <link rel="stylesheet" href="/static/fonts.css" />

                    <link rel="icon" href="icon_192x192.png" />
                    <link rel="icon" href="icon_512x512.png" sizes="512x512" />

                    {/* Web App Manifest  */}
                    <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
