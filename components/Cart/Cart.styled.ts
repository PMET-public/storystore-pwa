import styled from 'styled-components'

import { DetailsWrapper as CartListDetailsWrapper } from '@storystore/ui/dist/components/CartList/CartList.styled'
import { Root as ButtonRoot } from '@storystore/ui/dist/components/Button/Button.styled'

export const Root = styled.div`
    background-color: ${props => props.theme.colors.graySurface};
    display: grid;
    grid-template-rows: 1fr auto auto;
    grid-row-gap: 2rem;
    grid-column-gap: 2rem;
    height: 100%;

    @media ${props => props.theme.breakpoints.large} {
        grid-template-rows: 1fr;
        grid-template-columns: 1.25fr 0.75fr;
    }
`

export const ProductList = styled.div`
    background-color: ${props => props.theme.colors.surface};
    padding: 0 ${props => props.theme.layout.margin};
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 4rem;
    padding-top: 2rem;
    padding-bottom: 4rem;

    @media ${props => props.theme.breakpoints.medium} {
        padding-bottom: 0;

        ${CartListDetailsWrapper} {
            grid-template:
                'title price quantity'
                'sku sku sku'
                'options options options';
            grid-template-rows: repeat(3, max-content);
            grid-template-columns: 1fr auto auto;
            align-items: center;
        }
    }

    @media ${props => props.theme.breakpoints.large} {
        padding-top: 4rem;
    }
`

export const SummaryWrapper = styled.div`
    display: grid;
    grid-gap: 2rem;
    grid-auto-rows: max-content;

    @media ${props => props.theme.breakpoints.untilMedium} {
        padding: 2rem ${props => props.theme.layout.margin};
    }

    @media ${props => props.theme.breakpoints.large} {
        display: flex;
        align-items: flex-end;
        padding: 0 3rem;
    }
`

export const CartSummaryWrapper = styled.div`
    display: grid;
    grid-gap: 2rem;
    grid-auto-rows: max-content;
    width: 100%;

    @media ${props => props.theme.breakpoints.large} {
        position: sticky;
        bottom: 0;
        padding: 4rem 0;
        z-index: 1;
    }

    ${ButtonRoot} {
        @media ${props => props.theme.breakpoints.untilMedium} {
            display: none;
        }
    }
`

export const StickyButtonWrapper = styled.div`
    background-color: ${props => props.theme.colors.graySurface};
    border-top: 0.1rem solid ${props => props.theme.colors.onSurface10};
    bottom: 5.2rem; /* Include Tab  */
    display: grid;
    padding: 1.6rem ${props => props.theme.layout.margin};
    position: sticky;
    z-index: 1;

    @media ${props => props.theme.breakpoints.untilLarge} {
        @supports (backdrop-filter: blur(20px)) or (--webkit-backdrop-filter: blur(20px)) {
            background-color: ${props => props.theme.colors.surface50};
            backdrop-filter: blur(20px);
            transform: translateZ(0);
        }
    }

    @media ${props => props.theme.breakpoints.medium} {
        bottom: 0;
    }

    @media ${props => props.theme.breakpoints.large} {
        display: none;
    }
`
