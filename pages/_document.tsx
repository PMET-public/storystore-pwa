import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'
// import path from 'path'
// import { sync as dataUri } from 'datauri'

export default class extends Document {
    static async getInitialProps(ctx: any) {
        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage
        const locationOrigin = process.browser ? location.origin : ''

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App: any) => (props: any) => sheet.collectStyles(<App {...props} />),
                })

            const initialProps = await Document.getInitialProps(ctx)
            return {
                ...initialProps,
                locationOrigin,
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
                    <link rel="shortcut icon" href="/static/icons/favicon.ico" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <meta name="apple-mobile-web-app-title" content="Luma" />
                    <link rel="apple-touch-startup-image" />
                    <link rel="apple-touch-icon" href="/public/static/icons/apple-touch-icon.png" />

                    {/* Web App Manifest  */}
                    <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

                    {/* Fonts */}
                    <link rel="stylesheet" href="/static/fonts.css" />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
