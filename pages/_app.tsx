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

const App: FunctionComponent<{ cartId: string }> = ({ cartId, children }) => {
    const app = useQuery(APP_QUERY)

    const settings = app.data?.storyStore ?? {}

    return (
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
