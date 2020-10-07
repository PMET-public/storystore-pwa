import styled from 'styled-components'

import { Wrapper as ContainerWrapper } from '@storystore/ui/dist/components/Container/Container.styled'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
`

export const NoResult = styled(ContainerWrapper)`
    height: 70%;
    width: 100%;
    font-size: 1.4rem;
`
