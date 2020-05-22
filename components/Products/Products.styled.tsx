import styled from 'styled-components'

export const ProductListWrapper = styled.div`
    position: relative;
    z-index: 1;
    background-color: ${({ theme }) => theme.colors.surface};
    transition: width 250ms ease;
    will-change: width;
    transform: translateZ(0);
`

export const FiltersWrapper = styled.div`
    position: relative;
    width: 26rem;
    padding: 2rem 4rem;
    transition: opacity 450ms ease;
`

export const Root = styled.div<{ $showFilters?: boolean }>`
    display: grid;
    grid-template-columns: 1fr auto;

    ${ProductListWrapper} {
        width: ${({ $showFilters }) => ($showFilters ? '100%' : 'calc(100% + 26rem)')};
    }

    ${FiltersWrapper} {
        opacity: ${({ $showFilters }) => ($showFilters ? 1 : 0)};
    }
`
