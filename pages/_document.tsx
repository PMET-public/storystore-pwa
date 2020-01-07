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

                    {/* Fonts */}

                    <link href="https://use.typekit.net" rel="preconnect" crossOrigin="true" />
                    <link rel="stylesheet" href="/static/fonts.css" />

                    {/* iOS Splash */}
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1136&height=640&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2436&height=1125&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1792&height=828&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=828x&height=792&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1334&height=750&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1242&height=2688&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2208&height=1242&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1125&height=2436&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1242&height=2208&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2732&height=2048&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2688&height=1242&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2224&height=1668&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=750x&height=334&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2048&height=2732&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2388&height=1668&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1668&height=2224&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=640x&height=136&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1668&height=2388&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=2048&height=1536&format=png`}
                    />
                    <link
                        rel="apple-touch-startup-image"
                        media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
                        href={`/api/images?url=https://luma-pwa.now.sh/static/splash/master.png&width=1536&height=2048&format=png`}
                    />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
