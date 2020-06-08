import styled from 'styled-components'

export const Root = styled.div`
    background-color: ${props => props.theme.colors.onSurface10};
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
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    font-size: 1.4rem;
    color: ${props => props.theme.colors.onSurace90};
    grid-gap: 1rem;
    align-items: center;
`

export const Label = styled.div`
    font-weight: ${props => props.theme.typography.heading.weight.bold};
`

export const Value = styled.div``

export const Buttons = styled.div`
    display: grid;
    grid-auto-rows: 1fr;
    grid-gap: 1rem;
`

export const WarningList = styled.ul``

export const WarningItem = styled.li`
    background-color: ${props => props.theme.colors.warning5};
    border: 0.2rem solid ${props => props.theme.colors.warning50};
    padding: 1rem;
    display: grid;
    grid-gap: 1rem;
    grid-auto-flow: column;
    grid-template-columns: auto 1fr;
    align-items: center;

    & > svg {
        width: 2rem;
        fill: ${props => props.theme.colors.warning};
    }
`
