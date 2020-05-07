import styled from 'styled-components'

export const Root = styled.div<{ $appearance: 'inline' | 'stacked'; $sameWidth: boolean; $alignment?: string }>`
    ${props =>
        props.$appearance === 'stacked' &&
        `
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: ${props.$alignment || 'flex-start'};
            flex-direction: column;
        `}
`
