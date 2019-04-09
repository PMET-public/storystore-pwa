import { configure, addDecorator } from '@storybook/react'

import { withKnobs } from '@storybook/addon-knobs'
import { withA11y } from '@storybook/addon-a11y'
import { withInfo } from '@storybook/addon-info'

addDecorator(withKnobs)
addDecorator(withA11y)
addDecorator(withInfo({ 
    header: false,
    inline: true,
}))

const req = require.context('../stories', true, /\.stories\.js$/)

function loadStories() {
    req.keys().forEach(req)
}

configure(loadStories, module)

