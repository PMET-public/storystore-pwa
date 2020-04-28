import React, { useRef, useState, createContext, useMemo } from 'react'
import { Component } from '@pmet-public/storystore-ui/dist/lib'
import { Root } from './Buttons.styled'

export type ButtonsProps = {
    appearance?: 'stacked' | 'inline'
    sameWidth?: 'true' | 'false'
}

export const ButtonsContext = createContext({
    appearance: 'inline',
    sameWidth: false,
    maxWidth: 0,
    setMaxWidth: (x: any) => x,
})

export const Buttons: Component<ButtonsProps> = ({ children, appearance = 'inline', sameWidth: _sameWidth, ...props }) => {
    const rootElem = useRef<HTMLDivElement>(null)

    const [maxWidth, setMaxWidth] = useState<number>(0)

    const sameWidth = _sameWidth === 'true'

    const alignment = useMemo(() => {
        if (!rootElem.current) return 'flex-start'

        const alignment: any = {
            center: 'center',
            start: 'flex-start',
            end: 'flex-end',
        }

        const { textAlign } = getComputedStyle(rootElem.current)

        return alignment[textAlign]
    }, [])

    return (
        <Root ref={rootElem} $appearance={appearance} $alignment={alignment} $sameWidth={sameWidth} {...props}>
            <ButtonsContext.Provider value={{ appearance, maxWidth, setMaxWidth, sameWidth }}>{children}</ButtonsContext.Provider>
        </Root>
    )
}
