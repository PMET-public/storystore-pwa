import React from 'react'
import Skeleton from '@pmet-public/luma-ui/components/Skeleton'

export const ProductImageSkeleton = ({ ...props }) => {
    return (
        <Skeleton width={447.8} height={560.4} {...props}>
            <rect width="447.8" height="560.4" />
        </Skeleton>
    )
}
