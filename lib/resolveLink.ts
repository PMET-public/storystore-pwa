import { useRouter } from 'next/router'

export type LinkType = 'default' | 'category' | 'product' | 'page'

export const resolveLink = (url: string, type: LinkType = 'default') => {
    try {
        const linkUrl = new URL(url)
        return type !== 'default' ? linkUrl.pathname + linkUrl.search : url
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
