export const resolveLink = (url: string) => {
    try {
        const baseUrl = new URL(LUMA_ENV.MAGENTO_URL)
        const linkUrl = new URL(url)

        return baseUrl.host === linkUrl.host ? linkUrl.pathname + linkUrl.search : url
    } catch (_) {
        return url
    }
}
