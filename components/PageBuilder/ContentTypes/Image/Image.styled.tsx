import styled from 'styled-components'

import { Root as ImageRoot } from 'luma-ui/dist/components/Image/Image.styled'

export const Root = styled.div`
    ${ImageRoot} {
        overflow: hidden;
    }
`

export const Caption = styled.div`
    padding: 1rem;
    color: ${props => props.theme.colors.onSurface75};
    font-size: 1.4rem;
`
