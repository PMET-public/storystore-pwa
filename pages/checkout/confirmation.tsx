import React from 'react'
import { NextPage } from 'next'
import { withStoryStore } from '~/lib/storystore'

import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'

type ConfirmationProps = {}

export const Confirmation: NextPage<ConfirmationProps> = ({}) => {
    return <ConfirmationPage />
}

export default withStoryStore(Confirmation)
