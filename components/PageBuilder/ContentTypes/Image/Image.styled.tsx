import styled from 'styled-components'
import Image from '@storystore/ui/dist/components/Image'
import ImageRoot from '@storystore/ui/dist/components/Image/Image.styled'

export const Root = styled.div`
    & img,
    & object,
    & video {
        max-height: 100%;
        max-width: 100%;
        height: auto;
    }

    & ${ImageRoot} > div {
        display: inline-block;
    }
`

export const Caption = styled.div`
    padding: 1rem;
    color: ${props => props.theme.colors.onSurface75};
    font-size: 1.4rem;
`

export const Img = styled(Image)`
    display: inline-block;
`
