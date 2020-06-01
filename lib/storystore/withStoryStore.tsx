import React, { createContext, Reducer, useReducer } from 'react'
import { NextPage } from 'next'
import { COOKIE, getCookie, setCookie } from '~/lib/cookies'
import { getSettings } from '~/lib/getSettings'
import { useQuery } from '@apollo/react-hooks'
import { queryDefaultOptions } from '~/lib/apollo/client'
import { generateColorTheme } from '@storystore/ui/dist/theme/colors'

import STORYSTORE_QUERY from './graphql/storystore.graphql'

export type Settings = {
    magentoUrl: string

    // Content
    defaultHomePageId: string
    homePageId?: string
    footerBlockId?: string

    // Colors
    dark?: boolean
    colors?: {
        [key: string]: string
    }
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
        defaultHomePageId: 'home',
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
        const { data } = useQuery(STORYSTORE_QUERY, { ...queryDefaultOptions, errorPolicy: 'ignore' })

        const [state, dispatch] = useReducer(reducer, {
            ...initialState,
            cartId: getCookie(COOKIE.cartId, cookie) || '',
            settings: {
                ...initialState.settings,

                // Cookie Overwrites
                ...getSettings(cookie),

                // StoryStore!
                ...data?.content,

                colors: data?.colors && {
                    ...generateColorTheme({
                        accent: data.colors.accent,
                        onAccent: data.colors.onAccent,
                        primary: data.colors.primary,
                        onPrimary: data.colors.onPrimary,
                        secondary: data.colors.secondary,
                        onSecondary: data.colors.onSecondary,
                        ...(data.colors.dark && {
                            surface: '#222222',
                            onSurface: '#ffffff',
                        }),
                    }),
                },
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

            const cookie = (ctx.ctx || ctx).req?.headers.cookie

            let props = {}

            if (PageComponent.getInitialProps) {
                props = await PageComponent.getInitialProps(ctx)
            }

            return {
                cookie,
                ...props,
            }
        }
    }

    return WithStoryStore
}
