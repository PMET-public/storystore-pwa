import React from 'react'
import { storiesOf, } from '@storybook/react'
import { boolean } from '@storybook/addon-knobs'
import SidePanel from './SidePanel'
import { action } from '@storybook/addon-actions'


storiesOf('Components/SideNav', module)
    .add('Left', () => (
        <SidePanel
            position="left"
            isOpen={boolean('isOpen', true)}
            onClickClose={action('onClickClose')} />
    ))
    .add('Right', () => (
        <SidePanel
            position="right"
            isOpen={boolean('isOpen', true)}
            onClickClose={action('onClickClose')} />
    ))