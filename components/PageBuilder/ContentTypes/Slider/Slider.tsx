import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import SlickSlider from '@storystore/ui/dist/components/SlickSlider'

export type SliderProps = {}

export const Slider: Component<SliderProps> = ({ ...props }) => {
    return <SlickSlider {...props} />
}
