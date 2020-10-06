import styled from 'styled-components'
import FileIconSVG from 'remixicon/icons/Document/file-download-line.svg'

export const Root = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 3rem;
`

export const Downloads = styled.div`
    & h3 {
        font-weight: ${props => props.theme.typography.body.weight.semi};
    }

    & a {
        transition: border-color 450ms ease;
        border-bottom: 0.1rem solid transparent;
    }

    & a:hover {
        border-color: inherit;
    }

    margin-bottom: 2rem;
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 1.4rem;
`

export const DownloadIcon = styled(FileIconSVG)`
    width: 1em;
    height: 1em;
    display: inline-block;
    fill: ${props => props.theme.colors.accent75};
    vertical-align: middle;
    margin-right: 0.5rem;
`

export const DownloadLabel = styled.span`
    display: grid;
    grid-auto-flow: column;
    grid-auto-rows: max-content;
    grid-gap: 0.6rem;
`
