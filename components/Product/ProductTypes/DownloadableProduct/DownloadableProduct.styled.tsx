import styled from 'styled-components'
import FileIconSVG from 'remixicon/icons/Document/file-line.svg'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 3rem;
`

export const Downloads = styled.ul`
    h3 {
        font-weight: ${props => props.theme.typography.body.weight.semi};
        margin-bottom: 1rem;
    }

    margin-bottom: 2rem;
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 1rem;
`

export const DownloadIcon = styled(FileIconSVG)`
    width: 1em;
    height: 1em;
    display: inline-block;
    fill: ${props => props.theme.colors.accent50};
    vertical-align: middle;
    margin-right: 0.5rem;
`
