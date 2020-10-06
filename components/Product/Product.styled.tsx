import styled from 'styled-components'

import CarouselComponent from '@storystore/ui/dist/components/Carousel'
import ImageComponent from '@storystore/ui/dist/components/Image'
import { Root as BreadcrumbsRoot } from '@storystore/ui/dist/components/Breadcrumbs/Breadcrumbs.styled'

export const Root = styled.div`
    display: grid;
    /* grid-gap: 4rem; */
    grid-auto-rows: max-content;
`

export const Wrapper = styled.div`
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-rows: minmax(max-content, max-content);
    grid-gap: 1rem;

    @media ${props => props.theme.breakpoints.smallOnly} {
        display: grid;
        grid-auto-rows: max-content;
        grid-template-columns: 1fr;
    }

    @media ${props => props.theme.breakpoints.medium} {
        display: grid;
        grid-auto-rows: max-content;
        grid-gap: 2rem;
        grid-template-columns: 1.5fr 1fr;
        max-width: 260rem;
    }
`

export const Images = styled.div`
    display: grid;
    align-items: center;

    @media ${props => props.theme.breakpoints.smallOnly} {
        position: sticky;
        top: 6rem;
        z-index: 0;
        max-height: calc(100vh - 20rem);
    }
`

export const Image = styled(ImageComponent)`
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    max-height: 70vh;

    filter: unset;

    @media ${props => props.theme.breakpoints.smallOnly} {
        max-height: 70vh;
        object-fit: cover;
    }
`

export const Carousel = styled(CarouselComponent)`
    padding: 0;

    @media ${props => props.theme.breakpoints.medium} {
        display: none !important;
    }
`

export const CarouselItem = styled(Carousel.Item)`
    display: grid;
`

export const GalleryGrid = styled.div`
    @media ${props => props.theme.breakpoints.smallOnly} {
        display: none;
    }

    display: grid;
    grid-auto-flow: row;
    grid-gap: 0.5rem;
    grid-template-columns: 1fr 1fr;
    /* max-width: 120rem; */
    overflow: unset;

    & ${CarouselItem} {
        grid-column-end: span 2;

        @media ${props => props.theme.breakpoints.large} {
            grid-column-end: span 1;
            &:first-child,
            &:last-child:nth-child(even) {
                grid-column-end: span 2;
            }
        }
    }
`

export const InfoWrapper = styled.div`
    @media ${props => props.theme.breakpoints.smallOnly} {
        background-color: ${props => props.theme.colors.surface};
        border-radius: 1rem 1rem 0 0;
        box-shadow: 0 -0.5rem 0.3rem rgba(0, 0, 0, 0.05);
        color: ${props => props.theme.colors.onSurface};
        left: 50%;
        margin-left: -50vw;
        margin-top: -3rem;
        position: relative;
        width: 100vw;
        z-index: 1;
    }
`

export const InfoInnerWrapper = styled.div`
    @media ${props => props.theme.breakpoints.medium} {
        align-items: center;
        display: flex;
        justify-content: center;
        max-width: 60rem;
        padding: 4rem 2rem 4rem;
        position: sticky;
        top: 8rem;
        min-height: calc(100vh - 30rem);
    }
`

export const Info = styled.div`
    display: grid;
    grid-auto-rows: max-content;
    grid-gap: 3rem;
    padding: 2rem ${props => props.theme.layout.margin} 4rem;
    width: 100%;
`

export const Header = styled.header`
    display: grid;
    grid-gap: 1.3rem;
    grid-auto-flow: row;

    ${BreadcrumbsRoot} {
        font-size: 1.2rem;
    }
`

export const Title = styled.h2`
    font-family: ${props => props.theme.typography.heading.family};
    font-weight: ${props => props.theme.typography.heading.weight.semi};
    font-size: ${props => props.theme.typography.heading.size.secondary};
`

export const Sku = styled.span`
    font-size: 1.3rem;
    color: ${props => props.theme.colors.onSurface75};
`

export const ShortDescription = styled.div`
    font-size: 1.4rem;
    line-height: 1.3;
`

export const Description = styled.div`
    font-size: 1.4rem;
    line-height: 1.6;
    color: ${props => props.theme.colors.onSurface90};
`
