import styled from 'styled-components'

export const Root = styled.div<{ $overlayColor?: string }>`
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;

    & [id*='jarallax-container'] video,
    & [id*='jarallax-container'] iframe {
        transition: opacity 250ms ease-in;
        opacity: 0;
        z-index: 1 !important;
    }

    ${props =>
        props.$overlayColor &&
        `
            &::after {
                content: "";
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: ${props.$overlayColor};
            }
        `}
`
