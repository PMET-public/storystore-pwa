import styled from 'styled-components'

export const Root = styled.div<{ $appearance: 'inline' | 'stacked'; $sameWidth: boolean; $alignment?: string }>`
    gap: 1rem;
    display: inline-flex;
    flex-wrap: wrap;

    ${props =>
        props.$appearance === 'stacked' &&
        `
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: ${props.$alignment || 'flex-start'};
            flex-direction: column;
        `}
`
