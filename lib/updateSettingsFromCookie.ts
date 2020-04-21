import { getCookie, getCookieValueFromString, COOKIE } from './cookies'

export const updateSettingsFromCookie = (values: { [key: string]: any }, cookie?: string) => {
    const _overrides = process.browser
        ? getCookie(COOKIE.settings)
        : cookie && getCookieValueFromString(cookie, COOKIE.settings)

    const overrides = JSON.parse(_overrides || '{}')

    return { ...values, ...overrides }
}
