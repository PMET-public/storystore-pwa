import styled from 'styled-components'
import { Wrapper as ContainerWrapper } from '@storystore/ui/dist/components/Container/Container.styled'

export const Root = styled.div``

export const Wrapper = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.colors.surface};
    display: flex;
`

export const ProductListWrapper = styled(ContainerWrapper)``

export const FiltersWrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: scroll;
    scrollbar-width: none;
    padding: 4rem 3rem 0;
    &::-webkit-scrollbar {
        display: none;
    }
`

export const FiltersButtons = styled.div`
    background-color: ${props => props.theme.colors.surface75};
    color: ${props => props.theme.colors.onSurface};
    position: sticky;
    bottom: 0;
    display: grid;
    grid-gap: 2rem;
    padding: 2rem 0;
    @supports (padding: max(0px)) {
        padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }
`
