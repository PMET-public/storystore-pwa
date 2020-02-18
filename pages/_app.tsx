import React from 'react'
import { NextPage } from 'next'

import withApollo from '../apollo/with-apollo'
import NextNprogress from 'nextjs-progressbar'
import { AppProvider } from '@pmet-public/luma-ui/dist/AppProvider'

import App from '../components/App'
import ServiceWorkerProvider from '../components/ServiceWorker'

const MyApp: NextPage<any> = ({ Component, pageProps }) => {
    return (
        <ServiceWorkerProvider>
            <AppProvider>
                <App categoriesParentId={process.env.CATEGORIES_PARENT_ID} footerBlockId={process.env.FOOTER_BLOCK_ID}>
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
        </ServiceWorkerProvider>
    )
}

export default withApollo(MyApp)
