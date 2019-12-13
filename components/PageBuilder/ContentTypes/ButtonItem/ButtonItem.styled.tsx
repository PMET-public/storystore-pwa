import styled from 'styled-components'

import { Root as ButtonRoot } from '@pmet-public/luma-ui/dist/components/Button/Button.styled'

export const Root = styled.div<{ $secondary?: boolean }>`
    ${ButtonRoot} {
        background-color: ${props => (props.$secondary ? '#fff' : '#222')};
        color: ${props => (props.$secondary ? '#222' : '#fff')};
    }
`
