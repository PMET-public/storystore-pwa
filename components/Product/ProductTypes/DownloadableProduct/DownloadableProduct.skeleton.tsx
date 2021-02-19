import React from 'react'
import Skeleton from '@storystore/ui/dist/components/Skeleton'

export const DownloadableProducSkeleton = ({ ...props }) => {
    return (
        <Skeleton width={593} height={175} {...props}>
            <rect x="28.1" y="66" width="74" height="21" />
            <rect x="1.1" y="66" width="15" height="21" />
            <rect x="28.1" y="33" width="74" height="21" />
            <rect x="1.1" y="33" width="15" height="21" />
            <rect x="28.1" width="74" height="21" />
            <rect x="1.1" width="15" height="21" />
            <path
                d="M566.9,175H27c-14.9,0-27-12.1-27-27v0c0-14.9,12.1-27,27-27h539.9c14.9,0,27,12.1,27,27v0C593.9,162.9,581.9,175,566.9,175
	z"
            />
        </Skeleton>
    )
}
