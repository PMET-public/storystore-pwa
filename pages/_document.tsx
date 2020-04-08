import Document, { Head, Main, NextScript, DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class extends Document<any> {
    static async getInitialProps(ctx: DocumentContext) {
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
        return (
            <html lang="en">
                <Head>
                    <noscript>Enable javascript to run this web app.</noscript>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, minimum-scale=1, viewport-fit=cover" />
                    <meta name="theme-color" content="#222222" />
                    <link rel="shortcut icon" href="/static/favicon.ico" />
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

                    {/* Google Analytics */}
                    <link href="https://www.google-analytics.com" rel="preconnect" crossOrigin="anonymous" />
                    <link href="https://stats.g.doubleclick.net" rel="preconnect" crossOrigin="anonymous" />

                    {/* Adobe Fonts */}
                    <link href="https://use.typekit.net" rel="preconnect" crossOrigin="anonymous" />
                    <link href="https://p.typekit.net" rel="preconnect" crossOrigin="anonymous" />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
