import React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import Button from './'

storiesOf('Components/Button', module)
    .add('React', () => (
        <Button>
            { text('Text', 'button') }
        </Button>
    ))