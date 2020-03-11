import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { Settings } from 'react-slick'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const forms = elem.querySelectorAll('[data-product-sku]')

    const { appearance } = elem.dataset

    const carousel: Settings | undefined =
        appearance === 'carousel'
            ? {
                  autoplay: elem.getAttribute('data-autoplay') === 'true',
                  autoplaySpeed: parseInt(elem.getAttribute('data-autoplay-speed') || '0'),
                  infinite: elem.getAttribute('data-infinite-loop') === 'true',
                  arrows: elem.getAttribute('data-show-arrows') === 'true',
                  dots: elem.getAttribute('data-show-dots') === 'true',
                  centerMode: elem.getAttribute('data-carousel-mode') === 'continuous',
                  centerPadding: elem.getAttribute('data-center-padding') || undefined,
              }
            : undefined

    const skus = [...(forms as any)].map(form => form.getAttribute('data-product-sku'))

    return {
        appearance,
        skus,
        carousel,
        style,
    }
}

export default { component, props }
