import React from 'react'
import { Component } from '@pmet-public/luma-ui/lib'
import SlickSlider from '@pmet-public/luma-ui/components/SlickSlider'

export type SliderProps = {}

export const Slider: Component<SliderProps> = ({ ...props }) => {
    return <SlickSlider {...props} />
}
