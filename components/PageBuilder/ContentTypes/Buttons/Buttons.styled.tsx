import styled from 'styled-components'

import { Root as RootButtonComponent } from '@pmet-public/luma-ui/dist/components/Button/Button.styled'

export const Root = styled.div<{ $appearance: 'inline' | 'stacked'; $sameWidth: boolean }>`
    display: inline-grid !important;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    grid-auto-rows: max-content;
    grid-gap: 1rem;

    ${props =>
        props.$appearance === 'stacked' &&
        `
            grid-auto-flow: row;
        `}

    ${props =>
        props.$sameWidth &&
        `
            grid-auto-columns: 1fr;

            ${RootButtonComponent} {
                width: 100%;
            }
        `}
`
