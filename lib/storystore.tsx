import React, { createContext, Reducer, useReducer, useEffect, useCallback } from 'react'
import { NextPage } from 'next'
import { COOKIE, getCookie, setCookie } from '~/lib/cookies'
import { updateSettingsFromCookie } from '~/lib/updateSettingsFromCookie'
import useServiceWorker from '~/hooks/useServiceWorker'

type Settings = {
    magentoUrl: string
    homePageId: string
    footerBlockId?: string
    googleMapsApiKey?: string
}

type ReducerState = {
    cartId: string
    settings: Settings
}

type ReducerActions =
    | {
          type: 'setCartId'
          payload: string
      }
    | {
          type: 'setSettings'
          payload: { [key: string]: any }
      }

const initialState: ReducerState = {
    cartId: '',
    settings: {
        magentoUrl: process.env.MAGENTO_URL,
        homePageId: process.env.HOME_PAGE_ID,
        footerBlockId: process.env.FOOTER_BLOCK_ID,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
}

export const StoryStoreContext = createContext({
    ...initialState,
    setCartId: (payload: string) => {
        payload
    },
    setSettings: (payload: { [key: string]: any }) => {
        payload
    },
})

export const STORYSTORE_SHARED_DATA_ENDPOINT = '/local/storystore'

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'setCartId':
            setCookie(COOKIE.cartId, action.payload, 365)

            return {
                ...state,
                cartId: action.payload,
            }

        case 'setSettings':
            setCookie(COOKIE.settings, JSON.stringify(action.payload), 365)

            fetch(STORYSTORE_SHARED_DATA_ENDPOINT, { method: 'POST', body: JSON.stringify(action.payload) })

            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.payload,
                },
            }

        default:
            throw `Reducer action not valid.`
    }
}

export const withStoryStore = (PageComponent: NextPage<any>) => {
    const WithStoryStore = ({ cookie, ...pageProps }: any) => {
        const [state, dispatch] = useReducer(reducer, {
            cartId: getCookie(COOKIE.cartId, cookie) || '',
            settings: updateSettingsFromCookie(initialState.settings, cookie),
        })

        /**
         * Local Storage and Cookie data is not shared between iOS Safair and "installed PWA",
         * As a workaround, we sync the data from Cache Storage to a Cookie.
         *
         * Note: Chrome and Safari only expose `CacheStorage` to the windowed context over HTTPS.
         * window.caches will be undefined unless an SSL certificate is configured.
         * https://medium.com/@kozak.jakub55/how-to-share-state-data-between-a-pwa-in-ios-safari-and-standalone-mode-64174a48b043
         */
        const sw = useServiceWorker()

        const handleSyncData = useCallback(async () => {
            try {
                const res = await fetch(STORYSTORE_SHARED_DATA_ENDPOINT)
                const payload = await res.json()
                if (payload) dispatch({ type: 'setSettings', payload })
            } catch (error) {
                // Gotta catch 'em all
                console.error('🤔 There was an issue getting data from Cache Storage', error)
            }
        }, [dispatch])

        useEffect(() => {
            if (!sw || getCookie(COOKIE.settings)) return // No need to sync if Cookie already exist

            sw.addEventListener('controlling', handleSyncData)

            return () => {
                sw.removeEventListener('controlling', handleSyncData)
            }
        }, [sw, handleSyncData])

        return (
            <StoryStoreContext.Provider
                value={{
                    ...state,
                    setCartId: payload => {
                        dispatch({ type: 'setCartId', payload })
                    },
                    setSettings: payload => {
                        dispatch({ type: 'setSettings', payload })
                    },
                }}
            >
                <PageComponent {...pageProps} />
            </StoryStoreContext.Provider>
        )
    }

    if (PageComponent.getInitialProps) {
        WithStoryStore.getInitialProps = async (ctx: any) => {
            if (Boolean(ctx.ctx)) {
                console.error('withStoryStore does not support custom next.js _app. Please move to /pages/*.tsx')
            }

            let props = {}

            if (PageComponent.getInitialProps) {
                props = {
                    ...(await PageComponent.getInitialProps(ctx)),
                }
            }
            return { ...props, cookie: ctx.req?.headers.cookie }
        }
    }

    return WithStoryStore
}
