import styled from 'styled-components'
import { Root as ImageRoot } from '@storystore/ui/dist/components/Image/Image.styled'

export const Root = styled.div`
    display: grid;
    grid-gap: 4rem;
    grid-auto-rows: max-content;
    padding-top: 1rem;
`

export const Item = styled.div`
    ${ImageRoot} {
        float: left;
        margin-right: 2rem;
        border-radius: 1rem;
        overflow: hidden;
    }
`

export const Title = styled.div`
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.semi};
    margin-bottom: 1rem;
`

export const PriceContainer = styled.div`
    display: grid;
    grid-template-columns: max-content max-content;
    grid-gap: 1rem;
    align-items: center;
`
