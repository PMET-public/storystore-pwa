import { getCookie, getCookieValueFromString, COOKIE } from './cookies'

export const getSettings = (cookie?: string) => {
    const values = {
        magentoUrl: process.env.MAGENTO_URL,
        homePageId: process.env.HOME_PAGE_ID,
        footerBlockId: process.env.FOOTER_BLOCK_ID,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    }

    if (!Boolean(process.env.DEMO_MODE)) {
        return { ...values }
    }

    const _overrides = process.browser ? getCookie(COOKIE.settings) : cookie && getCookieValueFromString(cookie, COOKIE.settings)

    const overrides = JSON.parse(_overrides || '{}')

    return { ...values, ...overrides }
}
