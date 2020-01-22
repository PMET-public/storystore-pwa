import { useRouter } from 'next/router'

const magentoUrl = process.env.magentoUrl

export const resolveLink = (url: string) => {
    try {
        const baseUrl = new URL(magentoUrl)
        const linkUrl = new URL(url)

        return baseUrl.host === linkUrl.host ? linkUrl.pathname + linkUrl.search : url
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
