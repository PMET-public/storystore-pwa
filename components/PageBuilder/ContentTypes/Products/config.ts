import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { SlickSliderProps } from '@pmet-public/storystore-ui/dist/components/SlickSlider'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const forms = elem.querySelectorAll('[data-product-sku]')

    const { appearance } = elem.dataset

    const slider: SlickSliderProps | undefined =
        appearance === 'carousel'
            ? {
                  arrows: elem.dataset.showArrows === 'true',
                  autoplay: elem.dataset.autoplay === 'true',
                  autoplaySpeed: parseInt(elem.dataset.autoplaySpeed || '400'),
                  centerMode: elem.dataset.carouselMode === 'continuous',
                  centerPadding: elem.dataset.centerPadding || undefined,
                  dots: elem.dataset.showDots === 'true',
                  infinite: elem.dataset.infiniteLoop === 'true',
              }
            : undefined

    const skus = [...(forms as any)].map(form => form.dataset.productSku)

    return {
        appearance,
        slider,
        skus,
        style,
    }
}

export default { component, props }
