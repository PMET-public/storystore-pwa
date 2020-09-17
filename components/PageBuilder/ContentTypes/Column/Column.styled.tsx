import styled from 'styled-components'
import { ContentWithBackgroundProps } from '../../lib/ContentWithBackground'

export const Root = styled.div<ContentWithBackgroundProps & { $selfAlignment: string; $hero: boolean }>`
    align-self: ${props => props.$selfAlignment || 'stretch'};
    background-attachment: scroll !important;
    height: unset;

    @media ${props => props.theme.breakpoints.untilMedium} {
        ${props => props.$hero && `order: -1;`} /* Show as first */
        background-attachment: scroll !important;
        flex-basis: 100%;
        min-width: 100%;

        &[style] {
            margin-left: 0 !important;
            margin-right: 0 !important;
            margin-bottom: 0 !important;
        }

        /* &[style]:not(:first-child) {
            margin-top: ${props => props.theme.layout.margin} !important;
        } */
    }
`
