import React from 'react'
import { NextPage } from 'next'
import { withApollo } from '~/lib/apollo/withApollo'
import { withStoryStore } from '~/lib/storystore'

import { Confirmation as ConfirmationPage } from '~/components/Checkout/Confirmation'

type ConfirmationProps = {}

export const Confirmation: NextPage<ConfirmationProps> = ({}) => {
    return <ConfirmationPage />
}

export default withApollo(withStoryStore(Confirmation))
