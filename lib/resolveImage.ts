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
        quality?: number
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
        width?: number
        height?: number
    }
) => {
    const { format = canUseWebP() ? 'webp' : 'jpeg', quality = 100, fit = 'cover', width = 2000, height } =
        options || {}

    const { pathname } = new URL(url)

    if (pathname) {
        const result = [`/api/images`]
        result.push(`?url=${pathname}&format=${format}&quality=${quality}&fit=${fit}&width=${width}`)
        if (height) result.push(`&height=${height.toString()}`)

        return result.join('')
    } else {
        return url
    }
}
