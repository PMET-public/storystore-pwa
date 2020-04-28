import React from 'react'
import { Component } from '@pmet-public/storystore-ui/dist/lib'

import TabsWrapper, { TabList, Tab, TabPanel } from '@pmet-public/storystore-ui/dist/components/Tabs'

export type TabsProps = {
    activeTab: number
    tabsAlignment: 'left' | 'center' | 'right'
    minHeight: string
}

export const Tabs: Component<TabsProps> = ({ tabsAlignment, tabItems, activeTab, children, minHeight }) => {
    const selected = Number(activeTab)

    return (
        <TabsWrapper defaultIndex={selected}>
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
