import React, { useRef, useState, createContext, useEffect, useMemo } from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'
import { Root } from './Buttons.styled'

export type ButtonsProps = {
    appearance?: 'stacked' | 'inline'
    sameWidth?: 'true' | 'false'
}

export const ButtonsContext = createContext({
    sameWidth: false,
    maxWidth: 0,
    setMaxWidth: (x: any) => x,
})

export const Buttons: Component<ButtonsProps> = ({
    children,
    appearance = 'inline',
    sameWidth: _sameWidth,
    ...props
}) => {
    const rootElem = useRef<HTMLDivElement>(null)

    const [maxWidth, setMaxWidth] = useState<number>(0)

    const sameWidth = _sameWidth == 'true'

    useEffect(() => {
        if (!rootElem.current) return
        const { textAlign } = getComputedStyle(rootElem.current)
        console.log({ textAlign })
    }, [rootElem.current])

    const alignment = useMemo(() => {
        if (!rootElem.current) return 'flex-start'

        const alignment: any = {
            center: 'center',
            start: 'flex-start',
            end: 'flex-end',
        }

        const { textAlign } = getComputedStyle(rootElem.current)

        return alignment[textAlign]
    }, [rootElem.current])

    return (
        <Root ref={rootElem} $appearance={appearance} $alignment={alignment} $sameWidth={sameWidth} {...props}>
            <ButtonsContext.Provider value={{ maxWidth, setMaxWidth, sameWidth }}>{children}</ButtonsContext.Provider>
        </Root>
    )
}
