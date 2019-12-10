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
    const { format = 'jpeg', quality = 100, fit = 'cover', width = 2000, height } = options || {}

    const path = url.match(/^(?:[^\/]*(?:\/(?:\/[^\/]*\/?)?)?([^?]+)(?:\??.+)?)$/)

    if (path) {
        const result = [`/images/resize/${width}`]
        if (height) result.push(height.toString())
        result.push(`?url=${path[1]}&format=${format}&quality=${quality}&fit=${fit}`)

        return result.join('/')
    } else {
        return url
    }
}
