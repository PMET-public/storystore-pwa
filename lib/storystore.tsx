import React, { createContext, Reducer, useReducer, useEffect } from 'react'
import { NextPage } from 'next'
import { COOKIE, getCookie, setCookie } from '~/lib/cookies'
import { updateSettingsFromCookie } from '~/lib/updateSettingsFromCookie'

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

const CACHE_NAME = 'storystore'
const FAKE_ENDPOINT = '/local/storystore'

const setDataInCacheStorage = async (payload: any) => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const responseBody = JSON.stringify(payload)
        const response = new Response(responseBody)
        await cache.put(FAKE_ENDPOINT, response)

        console.log('Data saved in Cache Storage! 🎉')
    } catch (error) {
        // It's up to you how you resolve the error
        console.log('🤔 There was an issue saving data in Cache Storage', { error })
    }
}

const getDataFromCacheStorage = async () => {
    try {
        const cache = await caches.open(CACHE_NAME)
        const response = await cache.match(FAKE_ENDPOINT)

        if (!response) {
            return null
        }

        const responseBody = await response.json()
        return responseBody
    } catch (error) {
        // Gotta catch 'em all
        console.log('🤔 There was an issue getting data from Cache Storage', { error })
    }
}

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
            setDataInCacheStorage({ ...action.payload })

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
        useEffect(() => {
            const dataFromCookie = getCookie(COOKIE.settings)
            if (!dataFromCookie) {
                getDataFromCacheStorage().then(payload => {
                    console.log('🚚 Transfering data from Cache Storage to Cookie')
                    setCookie(COOKIE.settings, JSON.stringify(payload), 365)
                })
            }
        }, [dispatch])

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
