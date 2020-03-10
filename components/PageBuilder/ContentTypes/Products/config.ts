import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { ProductsCarousel } from './Products'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const forms = elem.querySelectorAll('[data-product-sku]')

    const { appearance } = elem.dataset

    const carousel: ProductsCarousel = {}

    if (appearance === 'carousel') {
        carousel.autoplay = elem.getAttribute('data-autoplay') === 'true'
        carousel.autoplaySpeed = parseInt(elem.getAttribute('data-autoplay-speed') || '0')
        carousel.infinite = elem.getAttribute('data-infinite-loop') === 'true'
        carousel.arrows = elem.getAttribute('data-show-arrows') === 'true'
        carousel.dots = elem.getAttribute('data-show-dots') === 'true'
        carousel.carouselMode = elem.getAttribute('data-carousel-mode')
        carousel.centerPadding = elem.getAttribute('data-center-padding')
    }

    const skus = [...(forms as any)].map(form => form.getAttribute('data-product-sku'))

    return {
        appearance,
        skus,
        ...carousel,
        style,
    }
}

export default { component, props }
