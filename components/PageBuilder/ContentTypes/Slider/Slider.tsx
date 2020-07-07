import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import dynamic from 'next/dynamic'

const SlickSlider = dynamic(() => import('@storystore/ui/dist/components/SlickSlider'))

export type SliderProps = {}

export const Slider: Component<SliderProps> = ({ ...props }) => {
    return <SlickSlider {...props} />
}
