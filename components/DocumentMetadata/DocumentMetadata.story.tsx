import React from 'react'
import { storiesOf } from '@storybook/react'
import { text } from '@storybook/addon-knobs'
import DocumentMetadata from './DocumentMetadata'

storiesOf('Utilities/DocumentMetadata', module)
    .add('default', () => (
        <DocumentMetadata 
            title={text('title', 'Luma Storyboard')}
            description={text('description', 'With more than 230 stores spanning 43 states and growing, Luma is a nationally recognized active wear manufacturer and retailer. We’re passionate about active lifestyles – and it goes way beyond apparel.')}
            keywords={text('keywords', 'luma, pwa, storefront, waka-waka')}
        />
    ))