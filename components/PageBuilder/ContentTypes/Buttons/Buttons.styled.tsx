import styled from 'styled-components'

import { Root as RootButtonComponent } from '@pmet-public/luma-ui/dist/components/Button/Button.styled'

export const Root = styled.div<{ $appearance: 'inline' | 'stacked'; $sameWidth: boolean; $alignment?: string }>`
    /* display: inline-grid !important;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    grid-auto-rows: max-content;
    grid-gap: 1rem; */
    display: inline-flex !important;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: ${props => props.$alignment || 'flex-start'};

    ${props =>
        props.$appearance === 'stacked' &&
        `
            flex-direction: column;
        `}

    ${props =>
        props.$sameWidth &&
        `

            ${RootButtonComponent} {
                width: 100%;
            }
        `}
`
