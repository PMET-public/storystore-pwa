import React from 'react'
import { Component } from '@storystore/ui/dist/lib'
import MapComponent from '@storystore/ui/dist/components/Map'

import useStoryStore from '~/hooks/useStoryStore'

type Location = {
    _id: number
    name: string
    lng: number
    lat: number
    country: string
    comment: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
}

export type MapProps = {
    locations: Location[]
}

export const Map: Component<MapProps> = ({ ...props }) => {
    const { settings } = useStoryStore()

    return <MapComponent apiKey={settings?.googleMapsApiKey ?? ''} {...props} />
}
