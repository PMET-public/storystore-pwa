export type LinkType = 'default' | 'category' | 'product' | 'page'

export const resolveLink = (url: string, type: LinkType = 'default'): { href: string; external?: boolean } => {
    try {
        if (type === 'default' && /^https?:\/\//i.test(url)) {
            return { href: url, external: true }
        } else {
            const { pathname, search, hash } = new URL(url, window.location.href)
            return { href: pathname + search + hash, external: false }
        }
    } catch (error) {
        console.error(error)
        return { href: url, external: true }
    }
}
