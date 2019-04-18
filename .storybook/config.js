import { configure, addDecorator, addParameters } from '@storybook/react'
import { themes } from '@storybook/theming'
import { withKnobs } from '@storybook/addon-knobs'
import { withA11y } from '@storybook/addon-a11y'
import { withInfo } from '@storybook/addon-info'

addDecorator(withInfo)
addDecorator(withKnobs)
addDecorator(withA11y)

addParameters({
    backgrounds: [
        { name: 'Dark', value: '#333', default: true },
        { name: 'Light', value: '#f9f9f9', default: false },
    ],
    options: {
        brand: 'Luma',
        theme: themes.dark,
    },
})

const req = require.context('../components', true, /\.(story|stories)\.tsx$/)

function loadStories() {
    req.keys().forEach(req)
}

configure(loadStories, module)

