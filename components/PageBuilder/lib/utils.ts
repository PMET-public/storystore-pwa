import { resolveImage } from '../../../lib/resolveImage'

export const getBackgroundImages = (string: string) => {
    const raw = JSON.parse(string.replace(/\\"/g, '"'))
    const desktop = raw.desktop_image ? resolveImage(raw.desktop_image) : ''
    const mobile = raw.mobile_image ? resolveImage(raw.mobile_image) : ''

    return desktop === undefined && mobile === undefined ? undefined : { desktop, mobile }
}

export const isPageBuilderHtml = (html: string) => /data-content-type=/.test(html)
