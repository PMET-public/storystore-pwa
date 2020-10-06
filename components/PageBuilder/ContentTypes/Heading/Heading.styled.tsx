import styled from 'styled-components'

export const Root = styled.div`
    &&& {
        font-family: ${props => props.theme.typography.heading.family};
        font-weight: ${props => props.theme.typography.heading.weight.semi};
        line-height: 1.25;
        /* font-size: 1.8rem; */
        word-break: break-word;
    }
`
