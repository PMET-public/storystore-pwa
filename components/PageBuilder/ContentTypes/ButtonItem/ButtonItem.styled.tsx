import styled from 'styled-components'

import { Root as ButtonRoot } from '@pmet-public/luma-ui/dist/components/Button/Button.styled'

export const Root = styled.div<{ $appearance?: string; $secondary?: boolean; $maxWidth?: number }>`
    &:not(:last-child) {
        ${props =>
            props.$appearance === 'inline'
                ? `
                    margin-inline-end: 1rem;
                    margin-bottom: 1rem;
                `
                : `
                    margin-bottom: 1rem;
                `}
    }

    ${ButtonRoot} {
        background-color: ${props => (props.$secondary ? '#fff' : '#222')};
        color: ${props => (props.$secondary ? '#222' : '#fff')};
        max-width: 100%;
        overflow: hidden;
        min-width: ${props => (props.$maxWidth ? `${props.$maxWidth}px` : 'auto')};
    }
`
