import styled from 'styled-components'

import { Wrapper as ContainerWrapper } from '@storystore/ui/dist/components/Container/Container.styled'

import FiltersIconSvg from 'remixicon/icons/Media/equalizer-line.svg'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    min-height: 100%;
}
`

export const TopBar = styled.div`
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${props => props.theme.colors.surface};
`

export const TopBarWrapper = styled(ContainerWrapper)`
    align-items: center;
    color: ${props => props.theme.colors.onSurface};
    display: grid;
    grid-template-columns: 1fr auto;
    height: 7rem;
`

export const Heading = styled.h2`
    -webkit-overflow-scrolling: touch;
    overflow-x: scroll;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }

    align-items: center;
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-auto-flow: column;
    grid-gap: 1rem;
    font-size: 1.3rem;

    @media ${props => props.theme.breakpoints.medium} {
        grid-gap: 2rem;
        font-size: 1.4rem;
    }
`

export const Title = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    grid-gap: 0.35em;
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.bold};
    font-size: 1.6rem;
    height: 2rem;
`

export const TopBarFilterButton = styled.button`
    margin-left: 1rem;
    & > span {
        align-items: center;
        display: grid;
        fill: currentColor;
        font-size: 2.4rem;
        grid-auto-columns: max-content;
        grid-auto-flow: column;
        grid-gap: 0.75rem;
    }
`

export const FiltersIcon = styled(FiltersIconSvg)`
    font-size: 1.8rem;
`
