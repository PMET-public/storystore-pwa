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
                        ...baseTheme.colors,
                        ...generateColorTheme({
                            accent: settings.colorAccent || baseTheme.colors.accent,
                            onAccent: settings.colorOnAccent || baseTheme.colors.onAccent,
                            primary: settings.colorPrimary || baseTheme.colors.primary,
                            onPrimary: settings.colorOnPrimary || baseTheme.colors.onPrimary,
                            secondary: settings.colorSecondary || baseTheme.colors.secondary,
                            onSecondary: settings.colorOnSecondary || baseTheme.colors.onSecondary,
                            ...(settings.colorDark && {
                                surface: '#222222',
                                onSurface: '#ffffff',
                            }),
                        }),
                        ...(settings.colorDark && {
                            graySurface: '#333333',
                        }),
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
