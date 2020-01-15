import styled from 'styled-components'

export const Root = styled.div`
    @media ${props => props.theme.breakpoints.smallOnly} {
        flex-wrap: wrap;
    }

    @media ${props => props.theme.breakpoints.untilMedium} {
        flex-direction: column;
    }
`
