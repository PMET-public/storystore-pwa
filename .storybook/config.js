import { configure, addDecorator } from '@storybook/react'

import { withKnobs } from '@storybook/addon-knobs'
import { withA11y } from '@storybook/addon-a11y'

addDecorator(withKnobs)
addDecorator(withA11y)


const req = require.context('../components', true, /\.(story|stories)\.tsx$/)

function loadStories() {
    req.keys().forEach(req)
}

configure(loadStories, module)

