import React, { useContext, createContext, useReducer, FunctionComponent, Reducer } from 'react'
import { COOKIE, setCookie, deleteCookie, getCookie, getCookieValueFromString } from '~/lib/cookies'
import { useApolloClient } from '@apollo/client'

export type Settings = {
    version?: string
    baseUrl?: string
    googleMapsApiKey?: string

    // Content
    homePage?: string
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
    magentoUrl?: string
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
}

type StoryStore = ReducerState & {
    settings?: Settings
    setCartId: (_payload: string) => void
    setMagentoUrl: (_payload: string) => void
    reset: () => void
}

export const StoryStoreContext = createContext<StoryStore>({
    ...initialState,
    setCartId: (_payload: string) => {},
    setMagentoUrl: (_payload: string) => {},
    reset: () => {},
})

export const useStoryStore = () => {
    return useContext(StoryStoreContext)
}

const reducer: Reducer<ReducerState, ReducerActions> = (state, action) => {
    switch (action.type) {
        case 'setCartId':
            return {
                ...state,
                cartId: action.payload,
            }

        case 'setMagentoUrl':
            return {
                cartId: '',
                magentoUrl: action.payload,
            }

        case 'reset':
            return {
                ...initialState,
            }

        default:
            throw `Reducer action not valid.`
    }
}

export const StoryStoreProvider: FunctionComponent<{ cartId: string; settings?: Settings }> = ({ children, cartId, settings }) => {
    const apolloClient = useApolloClient()

    const [state, dispatch] = useReducer(reducer, { ...initialState, cartId })

    return (
        <StoryStoreContext.Provider
            value={{
                ...state,
                settings,

                setCartId: payload => {
                    dispatch({ type: 'setCartId', payload })
                    payload ? setCookie(COOKIE.cartId, payload, 60) : deleteCookie(COOKIE.cartId)
                },
                setMagentoUrl: payload => {
                    dispatch({ type: 'setMagentoUrl', payload })
                    setCookie(COOKIE.settings, JSON.stringify({ magentoUrl: payload }), 365)
                    apolloClient?.resetStore().catch(() => {})
                },
                reset: () => {
                    dispatch({ type: 'reset' })
                    deleteCookie(COOKIE.cartId)
                    deleteCookie(COOKIE.settings)
                    apolloClient?.resetStore().catch(() => {})
                },
            }}
        >
            {children}
        </StoryStoreContext.Provider>
    )
}

export const getSettings = (cookie?: string) => {
    if (Boolean(process.env.CLOUD_MODE) === false) {
        return {}
    }

    const _overrides = process.browser ? getCookie(COOKIE.settings) : cookie && getCookieValueFromString(cookie, COOKIE.settings)

    const overrides = JSON.parse(_overrides || '{}')

    return { ...overrides }
}
