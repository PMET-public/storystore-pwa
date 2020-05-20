import styled from 'styled-components'

import { Wrapper as ContainerWrapper } from '@storystore/ui/dist/components/Container/Container.styled'
// import { Root as FiltersRoot } from '@storystore/ui/dist/components/Filters/Filters.styled'

import FiltersIconSvg from 'remixicon/icons/Media/equalizer-line.svg'
import BackIconSvg from 'remixicon/icons/System/arrow-left-line.svg'

export const Root = styled.div`
    display: grid;
    grid-template-areas:
        'toolbar toolbar'
        'list filters';
    /* grid-template-columns: auto; */
`

export const TopBar = styled.div`
    grid-area: toolbar;
    position: sticky;
    top: 0;
    z-index: 3;
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

export const BackIcon = styled(BackIconSvg)`
    width: 2rem;
    height: 2rem;
    fill: currentColor;
`
export const BackButton = styled.div`
    display: flex;
    align-items: center;
    /* padding-top: 0.3rem; */
`

export const TopBarFilterButton = styled.button`
    margin-left: 1rem;
    & > span {
        align-items: center;
        display: grid;
        fill: currentColor;
        font-size: 1.4rem;
        grid-auto-columns: max-content;
        grid-auto-flow: column;
        grid-gap: 0.75rem;
    }
`

export const FiltersIcon = styled(FiltersIconSvg)`
    width: 2rem;
`

export const Content = styled.div`
    grid-area: list;
    display: grid;
    grid-auto-rows: minmax(max-content, max-content);
    grid-gap: 3rem;
`

export const ProductListWrapper = styled(ContainerWrapper)``

export const FiltersWrapper = styled.div<{ $show?: boolean }>``
