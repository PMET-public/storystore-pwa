import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { SlickSliderProps } from '~/components/SlickSlider'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const { pbStyle } = elem.dataset

    const slider: SlickSliderProps = {
        arrows: elem.dataset.showArrows === 'true',
        autoplay: elem.dataset.autoplay === 'true',
        autoplaySpeed: parseInt(elem.dataset.autoplaySpeed || '400'),
        centerMode: elem.dataset.carouselMode === 'continuous',
        centerPadding: elem.dataset.centerPadding || undefined,
        dots: elem.dataset.showDots === 'true',
        fade: elem.dataset.fade === 'true',
        infinite: elem.dataset.infiniteLoop === 'true',
    }

    if (slider.fade) {
        slider.slidesToScroll = 1
    }

    return {
        'data-pb-style': pbStyle,
        ...slider,
        style,
    }
}

export default { component, props }
