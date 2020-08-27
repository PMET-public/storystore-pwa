if (!process.browser) {
    const { URL } = require('url')
    global.URL = URL
}

async function supportsWebp() {
    if (typeof createImageBitmap === 'undefined') return false

    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA='
    const blob = await fetch(webpData).then(r => r.blob())
    return createImageBitmap(blob).then(
        () => true,
        () => false
    )
}

export const resolveImage = (url: string, options?: { width?: number; height?: number }) => {
    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`]

        if (options?.width) query.push(`w=${options.width}`)

        if (options?.height) query.push(`h=${options.height}`)

        const webp =
            global.__webp ??
            (async () => {
                await supportsWebp()
            })()

        if (webp) query.push(`type=webp`)

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
