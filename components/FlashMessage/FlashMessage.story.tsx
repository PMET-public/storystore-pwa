import React from 'react'
import { storiesOf } from '@storybook/react'
import { text, select } from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'
import FlashMessage from './FlashMessage'

storiesOf('Components/FlashMessage', module)
    .add('React', () => (
        <FlashMessage
            type={select('type', { info: 'info', error: 'error', warning: 'warning' }, 'info')}
            message={text('message', 'Hello. Is this me you`re looking for?')}
            onClose={action('onClose')} />
    ))