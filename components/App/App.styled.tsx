import styled from 'styled-components'

import { Utilities as HeaderUtilities } from '@storystore/ui/dist/components/Header/Header.styled'
import { Wrapper as ContainerWrapper } from '@storystore/ui/dist/components/Container/Container.styled'

export const Root = styled.div`
    display: grid;
    background-color: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.onSurface};
    width: 100%;
    /* overflow-x: hidden; */

    grid-auto-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(calc(100vh - 6rem - 6rem), 1fr) auto auto;
    grid-template-areas:
        'header'
        'main'
        'footer'
        'tabBar';

    @media ${props => props.theme.breakpoints.medium} {
        grid-template-rows: auto minmax(calc(100vh - 6rem), 1fr) auto;
        grid-template-areas:
            'header'
            'main'
            'footer';
    }
`

export const HeaderContainer = styled(ContainerWrapper)`
    height: 6rem;
    grid-area: header;
    box-shadow: inset 0 -0.1rem 0 rgba(0, 0, 0, 0.09), inset 0 -0.2rem 0 rgba(255, 255, 255, 0.09);
    position: sticky;
    top: 0;
    z-index: 2;

    /** Translucent Bar */
    color: ${props => props.theme.colors.onSurface};
    background-color: ${props => props.theme.colors.primary95};

    /* Removing as it seems to be causing re-rendering issues */
    /* @supports (backdrop-filter: blur(10px)) or (--webkit-backdrop-filter: blur(10px)) {
        will-change: background-color;
        background-color: ${props => props.theme.colors.surface80};
        backdrop-filter: blur(10px);
    } */

    ${HeaderUtilities} {
        /* Hide Search and Cart on Mobile */
        & > [data-utilities-search],
        & > [data-utilities-cart] {
            @media ${props => props.theme.breakpoints.smallOnly} {
                display: none;
            }
        }
    }
`

export const Main = styled.main`
    grid-area: main;
    box-sizing: border-box;
    position: relative;
`

export const FooterContainer = styled(ContainerWrapper)`
    background-color: ${props => props.theme.colors.surface};
    grid-area: footer;
    box-shadow: inset 0 0.1rem 0 rgba(0, 0, 0, 0.09), inset 0 0.2rem 0 rgba(255, 255, 255, 0.09);
    z-index: 1;
`

export const Copyright = styled.div`
    padding: 4rem 2rem;
    text-align: center;
    font-size: 1.2rem;
    color: ${props => props.theme.colors.onSurface65};
`

export const TabBarContainer = styled(ContainerWrapper)`
    grid-area: tabBar;
    position: sticky;
    bottom: 0;
    z-index: 2;
    height: 6rem;
    color: ${props => props.theme.colors.onSurface};
    background-color: ${props => props.theme.colors.primary90};

    /* Removing as it seems to be causing re-rendering issues */
    /* @supports (backdrop-filter: blur(10px)) or (--webkit-backdrop-filter: blur(10px)) {
        will-change: background-color;
        background-color: ${props => props.theme.colors.surface80};
        backdrop-filter: blur(10px);
    } */

    @media ${props => props.theme.breakpoints.medium} {
        display: none;
    }
`

export const OfflineToast = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 1rem;
    align-items: center;
    & svg {
        fill: currentColor;
        width: 2rem;
    }
`

export const HamburgerButton = styled.button`
    position: relative;
    color: ${props => props.theme.colors.accent};
    line-height: 0;
    padding: 0.6rem;
    transition: background-color 250ms ease-in;
    background-color: ${props => props.theme.colors.accent10};
    border-radius: 0.7rem;
    z-index: 5;

    & > svg {
        fill: currentColor;
        width: 2rem;
    }

    &:hover {
        background-color: ${props => props.theme.colors.accent15};
    }
`
