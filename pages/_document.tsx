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
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="/static/favicon.ico" />

                    {/* Web App Manifest  */}
                    <link rel="apple-touch-startup-image" />
                    <link rel="manifest" href="/_next/static/manifest.webmanifest" crossOrigin="use-credentials" />

                    {/*... cross-browser https://developers.google.com/web/updates/2018/07/pwacompat */}
                    <script
                        async
                        src="https://cdn.jsdelivr.net/npm/pwacompat@2.0.6/pwacompat.min.js"
                        integrity="sha384-GOaSLecPIMCJksN83HLuYf9FToOiQ2Df0+0ntv7ey8zjUHESXhthwvq9hXAZTifA"
                        crossOrigin="anonymous"
                    />

                    {/* Say hi! to our store back-end */}
                    <link rel="preconnect" href="/graphql" />

                    {/* Adobe Fonts */}
                    <link rel="prefetch" as="style" href="https://use.typekit.net/ssh7gal.css" />
                </Head>
                <body className="custom_class">
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
