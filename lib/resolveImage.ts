// function canUseWebP() {
//     var elem = document.createElement('canvas')

//     if (!!(elem.getContext && elem.getContext('2d'))) {
//         // was able or not to get WebP representation
//         return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0
//     }

//     // very old browser like IE 8, canvas not supported
//     return false
// }

export const resolveImage = (url: string) => {
    const { pathname } = new URL(url)

    if (pathname) {
        const query = [`url=${pathname}`]

        return `/api/images?${query.join('&')}`
    } else {
        return url
    }
}
