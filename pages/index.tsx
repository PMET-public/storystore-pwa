import React, { FunctionComponent } from 'react'
import App from '@app/containers/App'
import BubbleCarousel, { BubbleCarouselItem } from 'luma-storybook/dist/components/BubbleCarousel'
import Image from 'luma-storybook/dist/components/Image'

const Index: FunctionComponent = () => (
    <App>
        <BubbleCarousel label='Shop the Look'>
            <BubbleCarouselItem 
                image="https://lorempixel.com/800/600/fashion/1"
                label="Minimalist"
            />
            <BubbleCarouselItem 
                image="https://lorempixel.com/800/600/fashion/1"
                label="Something Else"
            />
            <BubbleCarouselItem 
                image="https://lorempixel.com/800/600/fashion/1"
                label="And more"
            />
        </BubbleCarousel>

        <Image style={{ maxWidth: '100%' }} src="https://lorempixel.com/800/600/fashion/1" alt=""/>
        <Image style={{ maxWidth: '100%' }} src="https://lorempixel.com/800/600/fashion/2" alt=""/>
        <Image style={{ maxWidth: '100%' }} src="https://lorempixel.com/800/600/fashion/3" alt=""/>
        <Image style={{ maxWidth: '100%' }} src="https://lorempixel.com/800/600/fashion/4" alt=""/>
        <Image style={{ maxWidth: '100%' }} src="https://lorempixel.com/800/600/fashion/5" alt=""/>
        <Image style={{ maxWidth: '100%' }} src="https://lorempixel.com/800/600/fashion/6" alt=""/>
    </App>
)

export default Index
