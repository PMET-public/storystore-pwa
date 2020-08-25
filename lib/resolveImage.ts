if (!process.browser) {
    const { URL } = require('url')
    global.URL = URL
}

function canUseWebP() {
    const elem = document.createElement('canvas')

    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0
    }

    // very old browser like IE 8, canvas not supported
    return false
}

global.__webp = global.__webp ?? (process.browser && canUseWebP())

export const resolveImage = (url: string, options?: { width?: number; height?: number }) => {
    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`]

        if (options?.width) query.push(`w=${options.width}`)

        if (options?.height) query.push(`h=${options.height}`)

        if (global.__webp) query.push(`type=webp`)

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
