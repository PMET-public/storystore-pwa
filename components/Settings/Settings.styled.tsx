import styled from 'styled-components'

export const Root = styled.div`
    display: grid;
    grid-template-rows: max-content max-content;
    grid-gap: 2rem;
    height: 100%;
    align-items: flex-start;

    @media ${props => props.theme.breakpoints.large} {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: unset;
        grid-gap: 4rem;
    }
`

export const Title = styled.h2`
    font-size: ${props => props.theme.typography.heading.size.secondary};
    font-weight: ${props => props.theme.typography.heading.weight.semi};
    font-family: ${props => props.theme.typography.heading.family};
    margin-bottom: 3rem;
`

export const Overrides = styled.div`
    background-color: ${props => props.theme.colors.onSurface15};
    padding: 2rem;
    height: 100%;
`

export const Details = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    font-size: 1.4rem;
    color: ${props => props.theme.colors.onSurace90};
    padding: 2rem;
    grid-gap: 0.6rem;
    align-items: center;
    min-height: 30rem;

    @media ${props => props.theme.breakpoints.large} {
        grid-template-columns: auto 1fr;
        grid-auto-rows: max-content;
        grid-gap: 2rem;
    }
`

export const Label = styled.div`
    font-weight: ${props => props.theme.typography.heading.weight.bold};

    @media ${props => props.theme.breakpoints.untilMedium} {
        padding: 0.5rem;
    }
`

export const Value = styled.div`
    padding: 0.5rem;
`

export const Buttons = styled.div`
    display: grid;
    grid-gap: 1rem;
`
