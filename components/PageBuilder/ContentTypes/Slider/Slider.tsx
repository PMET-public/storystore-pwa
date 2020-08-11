import React from 'react'
import dynamic from 'next/dynamic'
import { Component } from '@storystore/ui/dist/lib'

const SlickSlider = dynamic(() => import('@storystore/ui/dist/components/SlickSlider'), { ssr: false })

export type SliderProps = {}

export const Slider: Component<SliderProps> = ({ ...props }) => {
    return <SlickSlider {...props} />
}
