import React, { useState, useCallback, HTMLAttributes } from 'react'
import { Component } from '@storystore/ui/dist/lib'
import { Root, Item, NavButton, ArrowIcon, SlickGlobalStyles } from './SlickSlider.styled'
import Slick, { Settings } from 'react-slick'

export type SlickSliderProps = Settings & {
    buttons?: {
        previous?: HTMLAttributes<HTMLButtonElement>
        next?: {
            text: HTMLAttributes<HTMLButtonElement>
        }
    }
}

export const SlickSlider: Component<SlickSliderProps> = ({ accessibility = true, beforeChange, afterChange, buttons, fade = false, children, ...props }) => {
    const draggable = !fade

    const [dragging, setDragging] = useState(false)

    const handleBeforeChange = useCallback(
        (currentSlide: number, nextSlide: number) => {
            if (draggable) setDragging(true)
            if (beforeChange) beforeChange(currentSlide, nextSlide)
        },
        [draggable, setDragging, beforeChange]
    )

    const handleAfterChange = useCallback(
        (currentSlide: number) => {
            if (draggable) setDragging(false)
            if (afterChange) afterChange(currentSlide)
        },
        [draggable, setDragging, afterChange]
    )

    const handleOnItemClick = useCallback(
        e => {
            if (draggable && dragging) {
                e.preventDefault()
            }
        },
        [draggable, dragging]
    )

    const items = React.Children.toArray(children)

    return (
        <React.Fragment>
            <SlickGlobalStyles />
            {items.length > 0 ? (
                <Root
                    $draggable={draggable}
                    as={Slick}
                    respondTo="min"
                    draggable={draggable}
                    fade={fade}
                    accesibility={accessibility}
                    beforeChange={handleBeforeChange}
                    afterChange={handleAfterChange}
                    prevArrow={
                        <NavButton aria-label="previous" {...buttons?.previous}>
                            <ArrowIcon />
                        </NavButton>
                    }
                    nextArrow={
                        <NavButton aria-label="next" {...buttons?.next}>
                            <ArrowIcon />
                        </NavButton>
                    }
                    {...props}
                >
                    {items.map((item: any, key) => {
                        return <Item key={item._id ?? key}>{React.cloneElement(item, { onClickCapture: handleOnItemClick, draggable: false })}</Item>
                    })}
                </Root>
            ) : null}
        </React.Fragment>
    )
}
