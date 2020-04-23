import React from 'react'
import Skeleton from '@pmet-public/luma-ui/components/Skeleton'

export const ProductImageSkeleton = () => {
    return (
        <Skeleton width={4} height={5} style={{ width: '100%', height: 'auto' }}>
            <rect width="100%" height="100%" />
        </Skeleton>
    )
}
