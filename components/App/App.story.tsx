import React from 'react'
import { storiesOf } from '@storybook/react'
// import { text } from '@storybook/addon-knobs'
import App from './App'
import { FlashMessageProps } from '../FlashMessage'

const flashMessage: FlashMessageProps = {
    type: 'info',
    message: 'Hello ',
}

storiesOf('Components/App', module)
    .add('default', () => (
        <App  flashMessage={flashMessage} />
    ))