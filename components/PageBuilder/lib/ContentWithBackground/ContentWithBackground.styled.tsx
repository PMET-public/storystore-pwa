import styled from 'styled-components'

export const Root = styled.div<{ $backgroundColor?: string; $fullScreen?: string }>`
    position: relative;
    width: 100%;
    background-color: ${props => props.$backgroundColor || 'transparent'};
    transition: background-color 200ms ease;
    height: 100%;
    overflow: hidden;
    z-index: 1;

    ${props =>
        props.$fullScreen &&
        `

            height: calc(90vh - 14rem);

            @media ${props.theme.breakpoints.medium} {
                height: calc(90vh - 6rem);
            }
        `}
`

export const BgImage = styled.div<{ $loaded?: boolean }>`
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;

    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-color: ${props => props.theme.colors.onSurface5};
    /** Transition */
    transition: opacity 200ms ease-out, filter 200ms ease-out;
    filter: blur(${props => (props.$loaded ? '0' : '5px')});
    opacity: ${props => (props.$loaded ? '1' : '0')};
    will-change: filter;
    transform: translateZ(0);
`

export const Content = styled.div`
    position: relative;
`
