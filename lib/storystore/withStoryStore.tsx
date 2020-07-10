import React, { createContext, Reducer, useReducer, useEffect } from 'react'
import { NextPage } from 'next'
import { COOKIE, getCookie, setCookie, deleteCookie } from '~/lib/cookies'
import { getSettings } from '~/lib/getSettings'
import { useQuery } from '@apollo/react-hooks'
import { queryDefaultOptions } from '~/lib/apollo/client'
import { useApolloClient } from '@apollo/react-hooks'

import STORYSTORE_QUERY from './graphql/storystore.graphql'

export type Settings = {
    version?: string
    magentoUrl?: string
    baseUrl?: string
    googleMapsApiKey?: string

    // Content
    defaultHomePageId?: string
    homePageId?: string
    footerBlockId?: string

    // Colors
    colorDark?: string

    colorAccent?: string
    colorOnAccent?: string

    colorPrimary?: string
    colorOnPrimary?: string

    colorSecondary?: string
    colorOnSecondary?: string
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
          type: 'setMagentoUrl'
          payload: string
      }
    | {
          type: 'reset'
      }

const initialState: ReducerState = {
    cartId: '',
    settings: {
        magentoUrl: '',
    },
}

export const StoryStoreContext = createContext({
    ...initialState,
    setCartId: (_payload: string) => {},
    setMagentoUrl: (_payload: string) => {},
    reset: () => {},
})

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'setCartId':
            return {
                ...state,
                cartId: action.payload,
            }

        case 'setMagentoUrl':
            return {
                ...state,
                cartId: '',
                settings: {
                    ...state.settings,
                    magentoUrl: action.payload,
                },
            }

        case 'reset':
            return {
                ...state,
                settings: {},
            }

        default:
            throw `Reducer action not valid.`
    }
}

export const withStoryStore = (PageComponent: NextPage<any>) => {
    const WithStoryStore = ({ cookie, ...pageProps }: any) => {
        const apolloClient = useApolloClient()

        const { data } = useQuery(STORYSTORE_QUERY, { ...queryDefaultOptions, errorPolicy: 'ignore' })

        const [state, dispatch] = useReducer(reducer, {
            ...initialState,
            cartId: getCookie(COOKIE.cartId, cookie) || '',
            settings: {
                ...initialState.settings,

                // Cookie Overwrites
                ...getSettings(cookie),
            },
        })

        const { cartId } = state

        useEffect(() => {
            if (cartId) setCookie(COOKIE.cartId, cartId ?? '', 365)
            else deleteCookie(COOKIE.cartId)
        }, [cartId])

        return (
            <StoryStoreContext.Provider
                value={{
                    ...state,

                    settings: {
                        ...state.settings,
                        ...data?.storyStore,
                    },

                    setCartId: payload => {
                        dispatch({ type: 'setCartId', payload })
                    },
                    setMagentoUrl: payload => {
                        dispatch({ type: 'setMagentoUrl', payload })
                        setCookie(COOKIE.settings, JSON.stringify({ magentoUrl: payload }), 365)
                        apolloClient?.resetStore().catch(() => {})
                    },
                    reset: () => {
                        dispatch({ type: 'reset' })
                        deleteCookie(COOKIE.settings)
                        apolloClient?.resetStore().catch(() => {})
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
