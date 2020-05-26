import styled from 'styled-components'
import { Root as FiltersRoot } from '@storystore/ui/dist/components/Filters/Filters.styled'

export const Root = styled.div``

export const ProductListWrapper = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.colors.surface};
`

export const FiltersWrapper = styled.div<{ $active?: boolean; $height?: string }>`
    max-width: calc(100vw - 3rem);
    min-width: 30rem;
    -webkit-overflow-scrolling: touch;
    background-color: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.onSurface};
    overflow: scroll;
    position: fixed;
    right: 0;
    top: 0;
    transform: translateX(100%);
    transition: transform 305ms ease-out;
    z-index: 3;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }

    ${FiltersRoot} {
        padding: 4rem 3rem;
    }

    ${props =>
        props.$active &&
        `
            box-shadow: 3rem 0 6rem rgba(0, 0, 0, 0.75);
            transform: translateX(0);    
        `}
`

export const FiltersButtons = styled.div`
    background-color: ${props => props.theme.colors.surface75};
    color: ${props => props.theme.colors.onSurface};
    position: sticky;
    bottom: 0;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 2rem;
    padding: 2rem;

    @supports (padding: max(0px)) {
        padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }
`

export const FiltersScreen = styled.div`
    position: fixed;
    height: 100%;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 2;
    background: ${props => props.theme.colors.surface50};
`
