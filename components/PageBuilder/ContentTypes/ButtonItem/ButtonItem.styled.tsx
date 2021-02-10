import styled from 'styled-components'

import { Root as ButtonRoot } from '@storystore/ui/dist/components/Button/Button.styled'

export const Root = styled.div<{ $appearance?: string; $secondary?: boolean; $link?: boolean; $maxWidth?: number }>`
    ${ButtonRoot} {
        background-color: ${props => (props.$secondary ? props.theme.colors.secondary : props.theme.colors.primary)};
        color: ${props => (props.$secondary ? props.theme.colors.onSecondary : props.theme.colors.onPrimary)};

        ${props =>
            props.$link &&
            `
                border: 0.1rem solid currentColor;
                background-color: transparent;
            `}

        max-width: 100%;
        overflow: hidden;
        min-width: ${props => (props.$maxWidth ? `${props.$maxWidth}px` : 'auto')};
    }
`
