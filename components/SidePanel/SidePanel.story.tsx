import React from 'react'
import { storiesOf, } from '@storybook/react'
import { boolean, select } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import SidePanel from './'


storiesOf('Components/SideNav', module)
    .add('React', () => (
        <SidePanel
            position={select('position', { left: 'left', right: 'right' }, 'left')}
            isOpen={boolean('isOpen', true)}
            onClickClose={action('onClickClose')} />
    ))