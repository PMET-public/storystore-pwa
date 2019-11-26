import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

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
                    <link rel="shortcut icon" href="/static/favicon.ico" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <meta name="apple-mobile-web-app-title" content="Luma" />
                    <link rel="apple-touch-startup-image" />
                    <link rel="apple-touch-icon" href="/static/ios-icon.png" />

                    {/* Web App Manifest  */}
                    <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />
                    <script
                        async
                        src="https://cdn.jsdelivr.net/npm/pwacompat@2.0.10/pwacompat.min.js"
                        integrity="sha384-I1iiXcTSM6j2xczpDckV+qhhbqiip6FyD6R5CpuqNaWXvyDUvXN5ZhIiyLQ7uuTh"
                        crossorigin="anonymous"
                    ></script>

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
