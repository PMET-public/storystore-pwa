import React from 'react'
import Skeleton from '@storystore/ui/dist/components/Skeleton'

export const ProductImageSkeleton = () => {
    return (
        <Skeleton width={960} height={960} style={{ width: '100%', height: 'auto' }}>
            <rect width="100%" height="100%" />
        </Skeleton>
    )
}
