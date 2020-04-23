import React, { createContext, Reducer, FunctionComponent, useReducer } from 'react'
import { getCookie, COOKIE, setCookie, getCookieValueFromString } from './cookies'
import { updateSettingsFromCookie } from './updateSettingsFromCookie'

type ReducerState = {
    cartId: string

    settings: {
        magentoUrl: string
        homePageId: string
        footerBlockId: string
        googleMapsApiKey: string
    }
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
        magentoUrl: '',
        homePageId: '',
        footerBlockId: '',
        googleMapsApiKey: '',
    },
}

export const StoryStoreContext = createContext({
    ...initialState,
    setCartId: (_payload: string) => {},
    setSettings: (_payload: { [key: string]: any }) => {},
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

export const StoryStoreProvider: FunctionComponent<{ cookie?: string }> = ({ cookie, children }) => {
    const [state, dispatch] = useReducer(reducer, {
        ...initialState,
        cartId: (process.browser ? getCookie(COOKIE.cartId) : cookie && getCookieValueFromString(cookie, COOKIE.cartId)) || '',
        settings: updateSettingsFromCookie(
            {
                magentoUrl: process.env.MAGENTO_URL,
                homePageId: process.env.HOME_PAGE_ID,
                footerBlockId: process.env.FOOTER_BLOCK_ID,
                googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
            },
            cookie
        ),
    })

    return (
        <StoryStoreContext.Provider
            value={{
                ...state,
                setCartId: payload => dispatch({ type: 'setCartId', payload }),
                setSettings: payload => dispatch({ type: 'setSettings', payload }),
            }}
        >
            {children}
        </StoryStoreContext.Provider>
    )
}
