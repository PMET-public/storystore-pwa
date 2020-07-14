import React, { createContext, Reducer, useReducer, useEffect } from 'react'
import { NextPage } from 'next'
import { COOKIE, getCookie, setCookie, deleteCookie } from '~/lib/cookies'
import { getSettings } from '~/lib/getSettings'
import { useQuery } from '@apollo/react-hooks'
import { queryDefaultOptions } from '~/lib/apollo/client'
import { useApolloClient } from '@apollo/react-hooks'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { initOnContext } from '~/lib/apollo/withApollo'

import STORYSTORE_QUERY from './graphql/storystore.graphql'
import APP_QUERY from '~/components/App/graphql/app.graphql'

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
    const WithStoryStore = ({ cookie, settings, ...pageProps }: any) => {
        const apolloClient = useApolloClient()

        const { data } = useQuery(STORYSTORE_QUERY, { ...queryDefaultOptions, errorPolicy: 'ignore', skip: !!settings })

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

                        ...settings,
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

            const context = ctx.ctx || ctx

            // Enable Cache Header
            if (!Boolean(process.env.CLOUD_MODE)) {
                context.res?.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
            }

            const cookie = context.req?.headers.cookie

            const props = PageComponent.getInitialProps ? await PageComponent.getInitialProps(context) : undefined

            // SSR Settings
            const { apolloClient }: { apolloClient: ApolloClient<NormalizedCacheObject> } = initOnContext(context)
            const settings = await apolloClient.query({ query: STORYSTORE_QUERY })

            // SSR App
            const app = props.includeAppData ? await apolloClient.query({ query: APP_QUERY }) : undefined

            return {
                cookie,
                settings: settings.data?.storyStore,
                app,
                ...props,
            }
        }
    }

    return WithStoryStore
}
