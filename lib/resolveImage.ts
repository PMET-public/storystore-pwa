function canUseWebP() {
    var elem = document.createElement('canvas')

    if (!!(elem.getContext && elem.getContext('2d'))) {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0
    }

    // very old browser like IE 8, canvas not supported
    return false
}

export const resolveImage = (
    url: string,
    options?: {
        format?: 'jpeg' | 'gif' | 'webp' | 'svg' | 'png'
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
        width?: number
        height?: number
    }
) => {
    const { format = canUseWebP() ? 'webp' : 'jpeg', fit, width, height } = options || {}

    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`, `format=${format}`]

        if (height) query.push(`height=${height.toString()}`)
        if (width) query.push(`width=${width.toString()}`)
        if (fit) query.push(`fit=${fit}`)

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
