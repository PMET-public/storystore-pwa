import React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class extends Document<any> {
    static async getInitialProps(ctx: DocumentContext) {
        /**
         * WebP Support
         */
        global.__webp = /image\/webp/.test(ctx.req?.headers.accept ?? '')

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
            <Html lang="en">
                <Head>
                    <link rel="stylesheet" href="/static/fonts.css" />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
