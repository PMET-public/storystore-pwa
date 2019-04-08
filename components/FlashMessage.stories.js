import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'
import FlashMessage from './FlashMessage'

storiesOf('FlashMessage', module)
    .addDecorator(withKnobs)
    .add('Error', () => (
        <FlashMessage type="error" message="You must not know about me, you must not know about me" />
    ))
    .add('Warning', () => (
        <FlashMessage type="warning" message="Warning, live without warning. I say a warning, Alright" />
    ))
    .add('Notice', () => (
        <FlashMessage type="notice" message="Hello. Is this me you\'re looking for?" />
    ))