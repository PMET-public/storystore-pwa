import styled from 'styled-components'

export const Root = styled.div``

export const ProductListWrapper = styled.div`
    position: relative;
    background-color: ${({ theme }) => theme.colors.surface};
`

export const SortByWrapper = styled.div``

export const FiltersWrapper = styled.div`
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: scroll;
    scrollbar-width: none;
    padding: 4rem 3rem 0;
    &::-webkit-scrollbar {
        display: none;
    }

    ${SortByWrapper} {
        margin-bottom: 4rem;
        display: grid;
        grid-gap: 1.4rem;
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
