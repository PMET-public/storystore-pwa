import React from 'react'
import Skeleton from '@pmet-public/luma-ui/components/Skeleton'

export const ProductImageSkeleton = () => {
    return (
        <Skeleton width={1274} height={1580} style={{ width: '1274px', height: 'auto', maxWidth: '100%' }}>
            <rect width="100%" height="100%" />
        </Skeleton>
    )
}
