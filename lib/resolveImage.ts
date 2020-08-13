if (!process.browser) {
    const { URL } = require('url')
    global.URL = URL
}

export const resolveImage = (url: string, options?: { width?: number; height?: number }) => {
    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`]

        if (options?.width) query.push(`w=${options.width}`)

        if (options?.height) query.push(`h=${options.height}`)

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
