import React, { FunctionComponent, useRef } from 'react'
import NextHead from 'next/head'

type Metadata = {
    title?: string
    titlePrefix?: string
    titleSuffix?: string
    description?: string
    keywords?: string
}
export type HeadProps = Metadata & {
    defaults?: Metadata
}

export const getFullPageTitle = (arr: Array<string | undefined>) => arr.filter(x => !!x).join(' | ')

export const Head: FunctionComponent<HeadProps> = ({
    title,
    titlePrefix,
    titleSuffix,
    description,
    keywords,
    defaults,
}) => {
    const globalsRef = useRef<Metadata>({ ...defaults })

    if (defaults) globalsRef.current = { ...globalsRef.current, ...defaults }

    const _title = title || globalsRef.current.title
    const _titlePrefix = titlePrefix || globalsRef.current.titlePrefix
    const _titleSuffix = titleSuffix || globalsRef.current.titleSuffix
    const _description = description || globalsRef.current.description
    const _keywords = keywords || globalsRef.current.keywords

    return (
        <NextHead>
            {_title && <title>{getFullPageTitle([_titlePrefix, _title, _titleSuffix])}</title>}
            {_description && <meta name="description" content={_description} />}
            {_keywords && <meta name="keywords" content={_keywords} />}
        </NextHead>
    )
}
