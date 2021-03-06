import styled from 'styled-components'

export const Root = styled.div`
    width: 100%;

    line-height: 1.4;

    & h1,
    & h2,
    & h3,
    & h4,
    & h5,
    & h6 {
        &:not(:first-child) {
            margin-top: 1.5rem;
        }
        &:not(:last-child) {
            margin-bottom: 1.5rem;
        }
    }

    & h1,
    & h2,
    & h3,
    & h4,
    & h5,
    & h6 {
        font-family: ${props => props.theme.typography.heading.family};
        word-break: break-word;
        line-height: 0.9;
    }

    & h1 {
        font-weight: ${props => props.theme.typography.heading.weight.bolder};
        font-size: 2.6rem;
        margin-top: 0rem;
        margin-bottom: 2rem;
    }

    & h2 {
        font-weight: ${props => props.theme.typography.heading.weight.bolder};
        font-size: 2.6rem;
        margin-top: 2.5rem;
        margin-bottom: 2rem;
    }

    & h3 {
        font-weight: ${props => props.theme.typography.heading.weight.bold};
        font-size: 1.8rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }

    & h4 {
        font-weight: ${props => props.theme.typography.heading.weight.bold};
        font-size: 1.4rem;
        margin-top: 2rem;
        margin-bottom: 2rem;
    }

    & h5 {
        font-weight: ${props => props.theme.typography.heading.weight.bold};
        font-size: 1.2rem;
        margin-top: 2rem;
        margin-bottom: 2rem;
    }

    & h6 {
        font-weight: ${props => props.theme.typography.heading.weight.bold};
        font-size: 1rem;
        margin-top: 2rem;
        margin-bottom: 2rem;
    }
`

export const RichText = styled(Root)`
    & p {
        &:not(:first-child) {
            margin-top: 1rem;
        }
        &:not(:last-child) {
            margin-bottom: 1rem;
        }
    }

    & ol,
    & ul {
        list-style-position: outside;
        margin-block-start: 0.2em;
        padding-inline-start: 2.6rem;
        display: grid;
        grid-gap: 0.65rem;
        grid-auto-rows: max-content;
    }

    & ul {
        list-style-type: disc;
        list-style-position: inside;
    }

    & ol {
        list-style-type: decimal;
    }

    & strong {
        font-weight: 600;
    }

    & em {
        font-style: italic;
    }

    & blockquote {
        font-size: 1.4rem;
        line-height: 1.4;
        margin: 1rem 0;
        font-weight: 300;
        font-style: italic;
    }

    & table {
        width: 100%;
        margin: 1rem 0;
        border-spacing: 0;
        /* border-left: 0.1rem solid ${props => props.theme.colors.onSurface25};
    border-top: 0.1rem solid ${props => props.theme.colors.onSurface25}; */
    }

    & table td,
    & table th {
        text-align: left;
        padding: 2rem;
        font-size: 1.6rem;
        line-height: 1.4;
        /* border-right: 0.1rem solid ${props => props.theme.colors.onSurface25};
    border-bottom: 0.1rem solid ${props => props.theme.colors.onSurface25}; */
    }

    & table th {
        background-color: ${props => props.theme.colors.onSurface25};
    }

    & code {
        background: ${props => props.theme.colors.onSurface};
        color: ${props => props.theme.colors.surface};
        display: block;
        padding: 2rem;
    }

    & a {
        color: ${props => props.theme.colors.onSurface75};
    }
`
