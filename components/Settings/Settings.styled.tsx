import styled from 'styled-components'

export const Root = styled.div`
    background-color: ${props => props.theme.colors.onSurface15};
    padding: 2rem;
    min-height: 100%;
`

export const Wrapper = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 4rem;
`

export const Title = styled.h2`
    font-size: ${props => props.theme.typography.heading.size.secondary};
    font-weight: ${props => props.theme.typography.heading.weight.semi};
    font-family: ${props => props.theme.typography.heading.family};
    margin-bottom: 4rem;
`

export const Details = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    font-size: 1.4rem;
    color: ${props => props.theme.colors.onSurace90};
    grid-gap: 2rem;
    align-items: center;
`

export const Label = styled.div`
    font-weight: ${props => props.theme.typography.heading.weight.bold};

    @media ${props => props.theme.breakpoints.untilMedium} {
        padding: 0.5rem;
    }
`

export const Value = styled.div``

export const Buttons = styled.div`
    display: grid;
    grid-auto-rows: 1fr;
    grid-gap: 1rem;
`
