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
                    <link rel="icon" href="/static/favicon.ico" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, viewport-fit=contain"
                    />

                    {/* Apple Specifi */}
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                    <link rel="apple-touch-startup-image" />
                    <link rel="apple-touch-icon" href="/_next/static/icons/icon_180x180.png" />

                    {/* Web App Manifest  */}
                    <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

                    {/*... cross-browser https://developers.google.com/web/updates/2018/07/pwacompat */}
                    <script
                        async
                        src="https://cdn.jsdelivr.net/npm/pwacompat@2.0.9/pwacompat.min.js"
                        integrity="sha384-VcI6S+HIsE80FVM1jgbd6WDFhzKYA0PecD/LcIyMQpT4fMJdijBh0I7Iblaacawc"
                        crossOrigin="anonymous"
                    ></script>

                    {/* Fonts */}
                    <link rel="stylesheet" href="/static/fonts.css" />
                </Head>
                <body className="custom_class">
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
