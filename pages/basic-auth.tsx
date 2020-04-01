import React from 'react'
import { NextComponentType } from 'next'

import Error from '../components/Error'

export type OfflineProps = {}

const Offline: NextComponentType<any, any, OfflineProps> = ({}) => {
    return (
        <Error type="401" button={{ text: 'Reload App', onClick: () => (window.location.href = '/') }} fullScreen>
            Authorization Required
        </Error>
    )
}

export default Offline
