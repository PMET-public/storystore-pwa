export const getProductGallery = (
    gallery: Array<{
        id: number
        file: string
        label: string
        disabled?: boolean
        type: 'image'
    }>,
    baseUrl = ''
) => {
    return gallery
        .filter((x: any) => x.disabled === false && x.type === 'image')
        .map(({ id, label, file }: any) => ({
            _id: id,
            alt: label,
            src: baseUrl + file,
        }))
        .sort((a: any, b: any) => a.position - b.position)
}
