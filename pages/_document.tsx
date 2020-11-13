import React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class extends Document {
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
            <Html lang="en">
                <Head>
                    <link rel="stylesheet" href="/static/fonts.css" />

                    {/* WebP Detection */}
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `

                                function canUseWebP() {
                                    if (typeof document === 'undefined') return false

                                    var elem = document.createElement('canvas');

                                    if (!!(elem.getContext && elem.getContext('2d'))) {
                                        // was able or not to get WebP representation
                                        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
                                    }

                                    // very old browser like IE 8, canvas not supported
                                    return false;
                                }

                                if (canUseWebP()) {
                                    document.documentElement.classList.add('webp');
                                }
                            `,
                        }}
                    />
                </Head>

                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
