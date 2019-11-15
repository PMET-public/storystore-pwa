export const resolveImage = (
    url: string,
    options?: {
        format?: 'jpeg' | 'gif' | 'webp' | 'raw'
        quality?: number
        crop?: boolean
        width?: number
        height?: number
        gravity?:
            | 'north'
            | 'northeast'
            | 'east'
            | 'southeast'
            | 'south'
            | 'southwest'
            | 'west'
            | 'northwest'
            | 'center'
            | 'centre'
        progressive?: boolean
    }
) => {
    const {
        format = 'jpeg',
        quality = 100,
        crop = false,
        width = 2000,
        height,
        gravity = 'centre',
        progressive = true,
    } = options || {}

    const path = url.match(/^(?:[^\/]*(?:\/(?:\/[^\/]*\/?)?)?([^?]+)(?:\??.+)?)$/)

    if (path) {
        const result = [`/images/resize/${width}`]
        if (height) result.push(height.toString())
        result.push(
            `?format=${format}&quality=${quality}&progressive=${progressive}&gravity=${gravity}&crop=${crop}&url=${path[1]}`
        )

        return result.join('/')
    } else {
        return url
    }
}
