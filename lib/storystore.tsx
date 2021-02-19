import { useContext } from 'react'
import { StoryStoreContext } from '~/components/StoryStore/StoryStore'
import { COOKIE, getCookie, getCookieValueFromString } from '~/lib/cookies'

export const getSettings = (cookie?: string) => {
    if (Boolean(process.env.CLOUD_MODE) === false) {
        return {}
    }

    const _overrides = process.browser ? getCookie(COOKIE.settings) : cookie && getCookieValueFromString(cookie, COOKIE.settings)

    const overrides = JSON.parse(_overrides || '{}')

    return { ...overrides }
}

export const useStoryStore = () => {
    return useContext(StoryStoreContext)
}
