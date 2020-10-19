import styled from 'styled-components'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    min-height: 100%;
`

export const HeadingWrapper = styled.div`
    overflow-y: hidden;
`

export const Heading = styled.div`
    overflow-x: scroll;
    overflow-y: hidden;
    align-items: center;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-auto-flow: column;
    grid-gap: 1rem;
    font-size: 1.3rem;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }

    @media ${props => props.theme.breakpoints.medium} {
        grid-gap: 2rem;
        font-size: 1.4rem;
    }
`

export const Title = styled.h2`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    grid-gap: 0.35em;
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.bold};
    font-size: 1.6rem;
    height: 2rem;
`

export const TopBarFilterToggleButton = styled.button`
    padding: 0.6rem;
    font-size: 2.4rem;
`

export const ProductsWrapper = styled.div`
    margin-bottom: 6rem;
`
