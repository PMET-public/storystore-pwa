import React from 'react'
import { storiesOf,  } from '@storybook/react'
import { boolean } from '@storybook/addon-knobs'
import Menu from './MainMenu'

storiesOf('Components/Menu', module)
    .add('Default', () => (
        <Menu isOpen={boolean('Open', true) }></Menu>
    ))