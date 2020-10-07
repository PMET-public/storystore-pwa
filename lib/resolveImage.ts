if (!process.browser) {
    const { URL } = require('url')
    global.URL = URL
}

export const resolveImage = (url: string, options?: { width?: number; height?: number; type?: string }) => {
    if (!url) return undefined

    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`]

        if (options) {
            const { width, height, type } = options

            if (width) query.push(`w=${width}`)

            if (height) query.push(`h=${height}`)

            if (type) query.push(`type=${type}`)
        }

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
