/**
 * ☢️ Experimental
 */

import { Root, RichText } from './PageBuilder.styled'
import React, { useState, useEffect } from 'react'
import { Component } from 'luma-ui/dist/lib'
import { ErrorBoundary } from 'luma-ui/dist/lib'
import { htmlToProps } from './lib/parser'
import { isPageBuilderHtml } from './lib/utils'

export type PageBuilderProps = {
    html: string
}

type PageBuilderFactoryProps = {
    component: Component
    items: any[]
    props: {
        [prop: string]: any
    }
}

const renderComponent = (Component: React.ComponentType<any>, props: any, items: any[]) => {
    return (
        <Component {...props}>
            {items.map((itemProps, index) => (
                <PageBuilderFactory key={index} {...itemProps} />
            ))}
        </Component>
    )
}

const PageBuilderFactory: Component<PageBuilderFactoryProps> = ({ component, items, props }) => {
    return component ? <ErrorBoundary>{renderComponent(component, props, items)}</ErrorBoundary> : null
}

export const PageBuilder: Component<PageBuilderProps> = ({ html, ...props }) => {
    const [items, setItems] = useState<Array<any> | null>(null)

    useEffect(() => {
        setItems(isPageBuilderHtml(html) ? htmlToProps(html).items : null)
    }, [html])

    return (
        <Root {...props}>
            {items ? (
                items.map((contentType, index) => <PageBuilderFactory key={index} {...contentType} />)
            ) : (
                <RichText dangerouslySetInnerHTML={{ __html: html }} />
            )}
        </Root>
    )
}
