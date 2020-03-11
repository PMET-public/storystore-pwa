import dynamic from 'next/dynamic'
import { getStyleAsObject } from '../../lib/getStyleAsObject'
import { Settings } from 'react-slick'

const component = dynamic(() => import('./'))

const props = (elem: HTMLElement) => {
    const style = getStyleAsObject(elem.style)

    const slider: Settings = {
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
        ...slider,
        style,
    }
}

export default { component, props }
