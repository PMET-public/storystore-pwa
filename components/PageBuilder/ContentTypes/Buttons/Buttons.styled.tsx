import styled from 'styled-components'

import { Root as RootButtonComponent } from '@pmet-public/storystore-ui/components/Button/Button.styled'

export const Root = styled.div<{ $appearance: 'inline' | 'stacked'; $sameWidth: boolean; $alignment?: string }>`
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
