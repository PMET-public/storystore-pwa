import React, { useEffect, useCallback } from 'react'
import { overrideSettingsFromCookie } from '~/lib/overrideFromCookie'
import { version } from '~/package.json'
import { useServiceWorker } from '~/hooks/useServiceWorker'
import NextNprogress from 'nextjs-progressbar'
import App from '~/components/App'
import ReactGA from 'react-ga'
import Router from 'next/router'
import { NextComponentType, NextPageContext, GetServerSideProps } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { baseTheme, BaseStyles } from '@pmet-public/luma-ui/src/theme'

const isProduction = process.env.NODE_ENV === 'production'

const FontStyles = createGlobalStyle`
    @font-face {
        font-family: 'source-sans-pro';
        src: url('https://use.typekit.net/af/61f808/00000000000000003b9b3d63/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/61f808/00000000000000003b9b3d63/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3')
                format('woff'),
            url('https://use.typekit.net/af/61f808/00000000000000003b9b3d63/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 400;
    }

    @font-face {
        font-family: 'source-sans-pro';
        src: url('https://use.typekit.net/af/422d60/00000000000000003b9b3d67/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/422d60/00000000000000003b9b3d67/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
                format('woff'),
            url('https://use.typekit.net/af/422d60/00000000000000003b9b3d67/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 700;
    }

    @font-face {
        font-family: 'source-sans-pro';
        src: url('https://use.typekit.net/af/9373a0/00000000000000003b9b3d68/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/9373a0/00000000000000003b9b3d68/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3')
                format('woff'),
            url('https://use.typekit.net/af/9373a0/00000000000000003b9b3d68/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i7&v=3')
                format('opentype');
        font-display: swap;
        font-style: italic;
        font-weight: 700;
    }

    @font-face {
        font-family: 'source-sans-pro';
        src: url('https://use.typekit.net/af/ffb1e2/00000000000000003b9b3d64/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/ffb1e2/00000000000000003b9b3d64/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3')
                format('woff'),
            url('https://use.typekit.net/af/ffb1e2/00000000000000003b9b3d64/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3')
                format('opentype');
        font-display: swap;
        font-style: italic;
        font-weight: 400;
    }

    @font-face {
        font-family: 'source-sans-pro';
        src: url('https://use.typekit.net/af/348732/00000000000000003b9b3d65/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/348732/00000000000000003b9b3d65/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3')
                format('woff'),
            url('https://use.typekit.net/af/348732/00000000000000003b9b3d65/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 600;
    }

    @font-face {
        font-family: 'rucksack';
        src: url('https://use.typekit.net/af/81f247/000000000000000000017746/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/81f247/000000000000000000017746/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3')
                format('woff'),
            url('https://use.typekit.net/af/81f247/000000000000000000017746/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 900;
    }

    @font-face {
        font-family: 'rucksack';
        src: url('https://use.typekit.net/af/9018b1/000000000000000000017742/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/9018b1/000000000000000000017742/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3')
                format('woff'),
            url('https://use.typekit.net/af/9018b1/000000000000000000017742/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 400;
    }

    @font-face {
        font-family: 'rucksack';
        src: url('https://use.typekit.net/af/5ecad7/000000000000000000017744/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/5ecad7/000000000000000000017744/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3')
                format('woff'),
            url('https://use.typekit.net/af/5ecad7/000000000000000000017744/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n6&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 600;
    }

    @font-face {
        font-family: 'rucksack';
        src: url('https://use.typekit.net/af/f1567f/000000000000000000017743/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3')
                format('woff2'),
            url('https://use.typekit.net/af/f1567f/000000000000000000017743/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3')
                format('woff'),
            url('https://use.typekit.net/af/f1567f/000000000000000000017743/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n5&v=3')
                format('opentype');
        font-display: swap;
        font-style: normal;
        font-weight: 500;
    }

    .tk-source-sans-pro {
        font-family: 'source-sans-pro', sans-serif;
    }

    .tk-rucksack {
        font-family: 'rucksack', sans-serif;
    }
`

const MyApp: NextComponentType<NextPageContext, any, any> = ({ Component, pageProps, cookie }) => {
    const env = {
        MAGENTO_URL: process.env.MAGENTO_URL,
        HOME_PAGE_ID: process.env.HOME_PAGE_ID,
        FOOTER_BLOCK_ID: process.env.FOOTER_BLOCK_ID,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        ...overrideSettingsFromCookie('MAGENTO_URL', 'HOME_PAGE_ID', 'FOOTER_BLOCK_ID', 'GOOGLE_MAPS_API_KEY')(cookie),
    }

    const workbox = useServiceWorker()

    /**
     * Update SW Cache on Route change
     */
    const handleRouteChange = useCallback(
        (url, error?: any) => {
            if (error || !workbox) return

            workbox.messageSW({
                type: 'CACHE_URLS',
                payload: {
                    urlsToCache: [url],
                },
            })

            ReactGA.pageview(url)
        },
        [workbox]
    )

    useEffect(() => {
        if (isProduction) {
            /**
             * Google Analytics
             */
            ReactGA.initialize('UA-162672258-1')
        }
    })

    useEffect(() => {
        Router.events.on('routeChangeComplete', handleRouteChange)

        return () => {
            Router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [handleRouteChange])

    /**
     * Google Analytics
     */
    useEffect(() => {
        if (!isProduction) return

        ReactGA.set({ dimension1: version }) // verion

        ReactGA.set({ dimension2: window.location.host }) // release

        if (env.MAGENTO_URL) {
            ReactGA.set({ dimension3: new URL(env.MAGENTO_URL).host }) // endpoint
        }

        ReactGA.pageview(window.location.pathname)
    }, [env])

    return (
        <ThemeProvider theme={baseTheme}>
            <BaseStyles />
            <FontStyles />

            <App footerBlockId={env.FOOTER_BLOCK_ID}>
                <NextNprogress
                    color="rgba(161, 74, 36, 1)"
                    startPosition={0.4}
                    stopDelayMs={200}
                    height={3}
                    options={{ showSpinner: false, easing: 'ease' }}
                />
                <Component env={env} {...pageProps} />
            </App>
        </ThemeProvider>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    return {
        props: {
            cookie: req?.headers.cookie,
        },
    }
}

export default withApollo({ ssr: true })(MyApp)
