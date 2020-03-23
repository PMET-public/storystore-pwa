import { getCookie, getCookieValueFromString } from './cookies'
// import { NextApiRequest } from 'next'
import { IncomingHttpHeaders } from 'http2'

export const SETTINGS_OVERRIDE_COOKIE = 'SETTINGS_OVERRIDES'

export const overrideSettingsFromCookie = (...variables: string[]) => (headers?: IncomingHttpHeaders) => {
    const _overrides = process.browser
        ? getCookie(SETTINGS_OVERRIDE_COOKIE)
        : headers?.cookie && getCookieValueFromString(headers.cookie, SETTINGS_OVERRIDE_COOKIE)

    const overrides = JSON.parse(_overrides || '{}')

    return variables.reduce((previous, key) => {
        const value = overrides[key]
        return value ? { ...previous, [key]: value } : { ...previous }
    }, {})
}
