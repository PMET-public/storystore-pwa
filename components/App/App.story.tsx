import React from 'react'
import { storiesOf } from '@storybook/react'
import { boolean } from '@storybook/addon-knobs'
import App from './'
import { FlashMessageProps } from '../FlashMessage'
import { action } from '@storybook/addon-actions'

const flashMessage: FlashMessageProps = {
    type: 'info',
    message: 'Hello ',
    onClose: action('onClose')
}

storiesOf('Components/App', module)
    .add('React', () => (
        <App flashMessage={boolean('Flash Message', false) ? flashMessage : undefined} />
    ))