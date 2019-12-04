import styled from 'styled-components'

export const Root = styled.div<{ $color?: 'primary' | 'secondary' }>`
    color: ${props => (props.$color === 'primary' ? '#222' : '#fff')};
`

export const ButtonLink = styled.span`
    padding: 1rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        text-decoration: underline;
    }
`
