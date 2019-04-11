import React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import FlashMessage from './FlashMessage'

storiesOf('Components/FlashMessage', module)
    .add('Notice', () => (
        <FlashMessage
            type="info"
            message={text('message', 'Hello. Is this me you`re looking for?')}
            onClose={action('onClose')} />
    ))
    .add('Warning', () => (
        <FlashMessage
            type="warning"
            message={text('message', 'Warning, live without warning. I say a warning, Alright')}
            onClose={action('onClose')} />
    ))
    .add('Error', () => (
        <FlashMessage
            type="error"
            message={text('message', 'You must not know about me, you must not know about me')}
            onClose={action('onClose')} />
    ))