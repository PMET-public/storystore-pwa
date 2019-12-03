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
                    <meta charSet="utf-8" />
                    <meta
                        name="viewport"
                        content="width=device-width, minimum-scale=1, initial-scale=1, viewport-fit=cover"
                    />
                    <meta name="theme-color" content="#222222" />
                    <link rel="shortcut icon" href="/static/favicon.ico" />

                    {/* iOS */}
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                    <meta name="apple-mobile-web-app-title" content="Luma" />

                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/640x1136.png"
                        media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    />
                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/750x1294.png"
                        media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                    />
                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/1242x2148.png"
                        media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    />
                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/1125x2436.png"
                        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                    />
                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/1536x2048.png"
                        media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
                    />
                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/1668x2224.png"
                        media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
                    />
                    <link
                        rel="apple-touch-startup-image"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/splash/2048x2732.png"
                        media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
                    />

                    <link
                        rel="apple-touch-icon"
                        href="https://raw.githubusercontent.com/PMET-public/luma-ui/develop/public/icons/apple-touch-icon.png"
                    />

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
