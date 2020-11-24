import styled from 'styled-components'

export const OptionLabel = styled.span`
    display: grid;
    grid-gap: 1rem;
    /* grid-auto-flow: column; */
    /* grid-auto-columns: max-content; */
    grid-template-columns: 1fr auto;
    align-items: center;
`

export const PriceWrapper = styled.span<{ $active?: boolean }>`
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    grid-gap: 1rem;
    opacity: ${props => (props.$active ? 1 : 0.5)};
    transition: opacity 200ms ease;
`

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 4rem;

    & *:checked {
        & ~ span > ${OptionLabel} > ${PriceWrapper} {
            font-weight: 800;
        }

        & ~ label > ${OptionLabel} > ${PriceWrapper} {
            font-weight: 800;
        }
    }
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
        border-bottom: 0.1rem solid ${props => props.theme.colors.onSurface5};
    }
`
