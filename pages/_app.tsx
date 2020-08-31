import React, { useMemo, FunctionComponent } from 'react'
import { AppProps } from 'next/app'
import { ApolloProvider, useQuery } from '@apollo/client'
import { StoryStoreProvider } from '~/lib/storystore'
import AppComponent, { APP_QUERY } from '~/components/App'
import { getCookie, COOKIE } from '~/lib/cookies'
import { initializeApollo } from '~/lib/apollo/client'
import { ThemeProvider } from 'styled-components'
import { baseTheme } from '@storystore/ui/dist/theme'
import { generateColorTheme } from '@storystore/ui/dist/theme/colors'
import Head from 'next/head'

const App: FunctionComponent<{ cartId: string }> = ({ cartId, children }) => {
    const app = useQuery(APP_QUERY, { fetchPolicy: 'cache-first' })

    const settings = app.data?.storyStore ?? {}

    return (
        <React.Fragment>
            <Head>
                <noscript>
                    <div style={{ padding: '2rem', backgroundColor: baseTheme.colors.error, color: baseTheme.colors.onError }}>🤔 Enable javascript to run this web app.</div>
                </noscript>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, minimum-scale=1, viewport-fit=cover" />
                <meta name="theme-color" content="#222222" />
                <link rel="shortcut icon" href="/static/favicon.ico" />
                {/* iOS */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black" />
                <meta name="apple-mobile-web-app-title" content="StoryStore PWA" />
                <link rel="apple-touch-icon" href="/static/icons/apple-touch-icon.png" />
                {/* Web App Manifest  */}
                <link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials" />

                {/* Google Analytics */}
                <link href="https://www.google-analytics.com" rel="preconnect" crossOrigin="anonymous" />
                <link href="https://stats.g.doubleclick.net" rel="preconnect" crossOrigin="anonymous" />

                {/* Adobe Fonts */}
                <link href="https://use.typekit.net" rel="preconnect" crossOrigin="anonymous" />
            </Head>
            <StoryStoreProvider cartId={cartId} settings={settings}>
                <ThemeProvider
                    theme={{
                        ...baseTheme,
                        colors: {
                            ...generateColorTheme({
                                surface: settings.colorDark ? '#222222' : '#ffffff',
                                onSurface: settings.colorDark ? '#ffffff' : '#222222',

                                primary: settings.colorPrimary || baseTheme.colors.primary,
                                onPrimary: settings.colorOnPrimary || baseTheme.colors.onPrimary,

                                secondary: settings.colorSecondary || baseTheme.colors.secondary,
                                onSecondary: settings.colorOnSecondary || baseTheme.colors.onSecondary,

                                accent: settings.colorAccent || baseTheme.colors.accent,
                                onAccent: settings.colorOnAccent || baseTheme.colors.onAccent,

                                error: '#ef5350',
                                onError: '#ffffff',

                                warning: '#f57c00',
                                onWarning: '#ffffff',

                                notice: '#0070f3',
                                onNotice: '#ffffff',

                                success: '#008b8b',
                                onSuccess: '#ffffff',
                            }),
                            graySurface: settings.colorDark ? '#333333' : '#f3f3f3',
                        },
                    }}
                >
                    <AppComponent {...app}>{children}</AppComponent>
                </ThemeProvider>
            </StoryStoreProvider>
        </React.Fragment>
    )
}

const MyApp = ({ Component, pageProps }: AppProps) => {
    const cartId = getCookie(COOKIE.cartId, pageProps.cookie) || ''

    const apolloClient = useMemo(() => initializeApollo(pageProps.initialState, pageProps.cookie), [pageProps])

    return (
        <ApolloProvider client={apolloClient}>
            <App cartId={cartId}>
                <Component {...pageProps} />
            </App>
        </ApolloProvider>
    )
}

export default MyApp
