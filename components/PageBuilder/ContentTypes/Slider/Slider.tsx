import React from 'react'
import { Component } from '@pmet-public/storystore-ui/dist/lib'
import SlickSlider from '@pmet-public/storystore-ui/dist/components/SlickSlider'

export type SliderProps = {}

export const Slider: Component<SliderProps> = ({ ...props }) => {
    return <SlickSlider {...props} />
}
