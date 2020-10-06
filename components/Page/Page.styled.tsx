import styled from 'styled-components'

export const Root = styled.div``

export const Heading = styled.h2`
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.bold};
    font-size: 1.6rem;
    padding: 2rem ${props => props.theme.layout.margin};
    width: ${props => props.theme.layout.containedWidth};
    margin: 0 auto;
`
