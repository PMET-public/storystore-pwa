import React, { createContext, Reducer, useReducer } from 'react'
import { NextPage } from 'next'
import { COOKIE, getCookie, setCookie } from '~/lib/cookies'
import { getSettings } from '~/lib/getSettings'

export type Settings = {
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
            settings: {
                ...getSettings(cookie),
            },
        })

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
