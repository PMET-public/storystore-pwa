import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import SlickSlider from '@pmet-public/luma-ui/dist/components/SlickSlider'

export type SliderProps = {}

export const Slider: Component<SliderProps> = ({ ...props }) => {
    return <SlickSlider {...props} />
}
