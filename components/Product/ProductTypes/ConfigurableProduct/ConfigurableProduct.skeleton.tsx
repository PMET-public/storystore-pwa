import React from 'react'
import Skeleton from '@storystore/ui/dist/components/Skeleton'

export const ConfigurableProductSkeleton = ({ ...props }) => {
    return (
        <Skeleton width={595} height={228} {...props}>
            <rect width="55" height="17" />
            <rect y="28" width="78" height="42" />
            <rect x="87" y="28" width="99" height="42" />
            <rect x="196" y="28" width="105" height="42" />
            <rect x="314" y="28" width="90" height="42" />
            <rect x="1" y="114.5" width="45" height="21" />
            <path
                d="M85.5,138.9h-14c-5.8,0-10.5-4.7-10.5-10.5v-14c0-5.8,4.7-10.5,10.5-10.5h14c5.8,0,10.5,4.7,10.5,10.5v14
	C95.9,134.3,91.3,138.9,85.5,138.9z"
            />
            <path
                d="M133.5,138.9h-14c-5.8,0-10.5-4.7-10.5-10.5v-14c0-5.8,4.7-10.5,10.5-10.5h14c5.8,0,10.5,4.7,10.5,10.5v14
	C144,134.3,139.3,138.9,133.5,138.9z"
            />
            <path d="M568,228H28.1c-14.9,0-27-12.1-27-27v0c0-14.9,12.1-27,27-27H568c14.9,0,27,12.1,27,27v0C595,215.9,582.9,228,568,228z" />
        </Skeleton>
    )
}
