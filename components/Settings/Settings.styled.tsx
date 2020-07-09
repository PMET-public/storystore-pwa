import styled from 'styled-components'

import { Root as ButtonRoot } from '@storystore/ui/dist/components/Button/Button.styled'

export const Root = styled.div`
    /* background-color: ${props => props.theme.colors.onSurface15}; */
    padding: 2rem;
    min-height: 100%;
    display: grid;
    grid-gap: 4rem;
    grid-auto-rows: max-content;
    background-color: ${props => props.theme.colors.onSurface10};
    max-width: 95rem;
    box-shadow: -0.2rem 0 1rem rgba(0, 0, 0, 0.15) inset;
`

export const Wrapper = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 4rem;
`

export const Title = styled.h2`
    font-size: ${props => props.theme.typography.heading.size.secondary};
    font-weight: ${props => props.theme.typography.heading.weight.semi};
    font-family: ${props => props.theme.typography.heading.family};
`

export const Details = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    font-size: 1.4rem;
    color: ${props => props.theme.colors.onSurace90};
    grid-gap: 2rem;
    align-items: center;
`

export const Label = styled.div`
    font-weight: ${props => props.theme.typography.heading.weight.bold};

    @media ${props => props.theme.breakpoints.untilMedium} {
        padding: 0.5rem;
    }
`

export const Value = styled.div``

export const Buttons = styled.div`
    display: grid;
    grid-auto-rows: 1fr;
    grid-gap: 1rem;
`

export const RootErrors = styled.ul`
    list-style-type: none;
    display: grid;
    grid-gap: 1rem;
    grid-auto-rows: max-content;
`

export const ErrorItem = styled.li<{ $level?: 'warning' | 'error' | 'notice' }>`
    background-color: ${props => props.theme.colors[props.$level ?? 'error']}15;
    border: 0.1rem solid ${props => props.theme.colors[props.$level ?? 'error']};
    padding: 2rem;
    display: grid;
    grid-gap: 1rem;
    font-size: 1.4rem;
    line-height: 1.3;
    border-radius: 0.3rem;

    & ${ButtonRoot} {
        margin-top: 1rem;

        & > span {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: max-content;
            grid-gap: 0.5rem;
        }
    }
`

export const ErrorItemContent = styled.div`
    display: flex;
    align-items: center;
`

export const ErrorItemIcon = styled.span`
    font-size: 2em;
    padding-right: 1rem;
    fill: currentColor;
`
