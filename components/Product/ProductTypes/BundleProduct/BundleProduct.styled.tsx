import styled from 'styled-components'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 4rem;
`

export const Configuration = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 2rem;
`

export const Fieldset = styled.fieldset`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 2rem;
    background-color: ${props => props.theme.colors.onSurface5};
    border-radius: 2rem;
    padding: 2rem;

    &:not(:last-of-type) {
        padding-bottom: 3rem;
        border-bottom: 0.1rem solid ${props => props.theme.colors.onSurface5};
    }
`

export const OptionLabel = styled.span`
    display: grid;
    grid-gap: 1rem;
    /* grid-auto-flow: column; */
    /* grid-auto-columns: max-content; */
    grid-template-columns: 1fr auto;
    align-items: center;
`

export const PriceWrapper = styled.span`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    font-weight: 600;
`
