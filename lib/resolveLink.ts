import { useRouter } from 'next/router'

export const resolveLink = (url: string) => {
    try {
        const magentoHost = new URL(process.env.MAGENTO_URL).host
        const linkUrl = new URL(url)

        return magentoHost === linkUrl.host ? linkUrl.pathname + linkUrl.search : url
    } catch (_) {
        return url
    }
}

export const useIsUrlActive = () => {
    const router = useRouter()

    return (href: string) => {
        if (!router) return false

        const { route, query } = router

        return href === (query.url || (query['*'] ? `/${query['*']}` : route))
    }
}
