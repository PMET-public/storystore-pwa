// function canUseWebP() {
//     var elem = document.createElement('canvas')

//     if (!!(elem.getContext && elem.getContext('2d'))) {
//         // was able or not to get WebP representation
//         return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0
//     }

//     // very old browser like IE 8, canvas not supported
//     return false
// }

// const webP = typeof document !== 'undefined' && canUseWebP()

export const resolveImage = (url: string, options?: { width?: number; height?: number }) => {
    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`]

        // if (webP) query.push('webp=true')

        if (options?.width) query.push(`width=${options.width}`)

        if (options?.height) query.push(`height=${options.height}`)

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
