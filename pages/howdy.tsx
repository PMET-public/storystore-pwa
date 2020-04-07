import React from 'react'
import styled from 'styled-components'

const Howdy = styled.div`
    font-size: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.bolder};
`

export default () => <Howdy>🤠 Howdy!</Howdy>
