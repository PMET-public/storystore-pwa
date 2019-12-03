import React from 'react'
import NextApp from 'next/app'
import withApollo from '../apollo/with-apollo'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'

import App from '../components/App'

class MyApp extends NextApp {
    render() {
        const { Component, pageProps } = this.props

        return (
            <AppProvider>
                <App>
                    <NextNprogress
                        color="rgba(161, 74, 36, 1)"
                        startPosition={0.4}
                        stopDelayMs={200}
                        height={3}
                        options={{ showSpinner: false, easing: 'ease' }}
                    />
                    <Component {...pageProps} />
                </App>
            </AppProvider>
        )
    }
}

export default withApollo(MyApp)
