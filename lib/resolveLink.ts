export const resolveLink = (url: string) => {
    const baseUrl = new URL(LUMA_ENV.MAGENTO_CLOUD_URL)
    const linkUrl = new URL(url)

    return baseUrl.host === linkUrl.host ? linkUrl.pathname + linkUrl.search : url
}
