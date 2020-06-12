import { getCookie, getCookieValueFromString, COOKIE } from './cookies'

export const getSettings = (cookie?: string) => {
    if (!Boolean(process.env.CLOUD_MODE)) {
        return {}
    }

    const _overrides = process.browser ? getCookie(COOKIE.settings) : cookie && getCookieValueFromString(cookie, COOKIE.settings)

    const overrides = JSON.parse(_overrides || '{}')

    return { ...overrides }
}
