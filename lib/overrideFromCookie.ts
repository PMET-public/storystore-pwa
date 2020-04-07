import { getCookie, getCookieValueFromString } from './cookies'

export const SETTINGS_OVERRIDE_COOKIE = 'SETTINGS_OVERRIDES'

export const overrideSettingsFromCookie = (...variables: string[]) => (cookie?: string) => {
    const _overrides = process.browser
        ? getCookie(SETTINGS_OVERRIDE_COOKIE)
        : cookie && getCookieValueFromString(cookie, SETTINGS_OVERRIDE_COOKIE)

    const overrides = JSON.parse(_overrides || '{}')

    return variables.reduce((previous, key) => {
        const value = overrides[key]
        return value ? { ...previous, [key]: value } : { ...previous }
    }, {})
}
