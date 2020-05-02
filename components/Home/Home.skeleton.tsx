import React from 'react'
import Skeleton from '@storystore/ui/dist/components/Skeleton'

export const HomeSkeleton = () => (
    <Skeleton style={{ height: '100vh', width: '100vw ' }}>
        <rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" style={{ height: '100vh', width: '100vw ' }} />
    </Skeleton>
)
