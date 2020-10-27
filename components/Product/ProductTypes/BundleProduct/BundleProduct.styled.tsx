import styled from 'styled-components'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 3rem;
`

export const OptionLabel = styled.span`
    display: grid;
    grid-gap: 1rem;
    /* grid-auto-flow: column; */
    /* grid-auto-columns: max-content; */
    grid-template-columns: 1fr auto auto;
    align-items: center;
`
