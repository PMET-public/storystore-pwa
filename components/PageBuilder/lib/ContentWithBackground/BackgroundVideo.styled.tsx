import styled from 'styled-components'

export const Root = styled.div`
    position: relative;
    z-index: 0;

    & [id*='jarallax-container'] video,
    & [id*='jarallax-container'] iframe {
        transition: opacity 500ms ease;
        opacity: 0;
        z-index: 1 !important;
    }
`
