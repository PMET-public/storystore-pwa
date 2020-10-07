import React from 'react'
import Skeleton from '@storystore/ui/dist/components/Skeleton'

export const PageSkeleton = ({ ...props }) => (
    <Skeleton {...props} style={{ width: '100%', height: '100vh', display: 'block', ...props.style }}>
        <rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
    </Skeleton>
)
