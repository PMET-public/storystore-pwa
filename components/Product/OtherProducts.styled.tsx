import styled from 'styled-components'

export const CarouselWrapper = styled.div`
    padding: 4rem 0;
    max-width: 100%;
`
export const Title = styled.h2`
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.semi};
    font-size: ${props => props.theme.typography.heading.size.secondary};
    padding: 0 2rem 4rem;
`
