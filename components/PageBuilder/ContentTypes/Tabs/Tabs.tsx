import React from 'react'
import { Component } from '@pmet-public/luma-ui/dist/lib'

import TabsWrapper, { TabList, Tab, TabPanel } from '@pmet-public/luma-ui/dist/components/Tabs'

export type TabsProps = {
    appearance: string
    activeTab: number
    tabsAlignment: 'left' | 'center' | 'right'
    minHeight: string
}

export const Tabs: Component<TabsProps> = ({
    appearance,
    tabsAlignment,
    tabItems,
    activeTab,
    children,
    minHeight,
    ...props
}) => {
    const selected = Number(activeTab)

    return (
        <TabsWrapper defaultIndex={selected} {...props}>
            <TabList align={tabsAlignment}>
                {tabItems.map((label: string, index: number) => (
                    <Tab key={index}>{label}</Tab>
                ))}
            </TabList>

            {React.Children.map(children, (child, index) => (
                <TabPanel key={index} style={{ minHeight }}>
                    {child}
                </TabPanel>
            ))}
        </TabsWrapper>
    )
}
