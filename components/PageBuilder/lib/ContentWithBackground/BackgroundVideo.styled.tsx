import styled from 'styled-components'

export const Root = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;

    & [id*='jarallax-container'] video,
    & [id*='jarallax-container'] iframe {
        transition: opacity 300ms ease;
        opacity: 0;
        z-index: 1 !important;
    }
`
