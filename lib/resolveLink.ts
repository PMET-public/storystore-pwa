import { useRouter } from 'next/router'

export const resolveLink = (url: string) => {
    try {
        const baseUrl = new URL(LUMA_ENV.MAGENTO_URL)
        const linkUrl = new URL(url)

        return baseUrl.host === linkUrl.host ? linkUrl.pathname + linkUrl.search : url
    } catch (_) {
        return url
    }
}

export const useIsUrlActive = () => {
    const router = useRouter()

    if (!router) return false

    const { route, query } = router

    return (href: string) => href === (query.url || (query['*'] ? `/${query['*']}` : route))
}
