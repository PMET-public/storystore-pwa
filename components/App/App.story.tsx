import React from 'react'
import { storiesOf } from '@storybook/react'
import { boolean } from '@storybook/addon-knobs'
import App from './App'
import { FlashMessageProps } from '../FlashMessage'

const flashMessage: FlashMessageProps = {
    type: 'info',
    message: 'Hello ',
}

storiesOf('Components/App', module)
    .add('Default', () => (
        <App flashMessage={boolean('Flash Message', false) ? flashMessage : undefined} />
    ))