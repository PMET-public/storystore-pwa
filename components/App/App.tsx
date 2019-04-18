import React, { Fragment, FunctionComponent } from 'react'
import { DocumentMetadata, DocumentMetadataProps } from '@luma/components/DocumentMetadata'
import { FlashMessage, FlashMessageProps } from '@luma/components/FlashMessage'

export type AppProps = {
    metadata?: DocumentMetadataProps
    flashMessage?: FlashMessageProps
}


export const App: FunctionComponent<AppProps> = ({ metadata, flashMessage, children }) => (
    <Fragment>
        { metadata && <DocumentMetadata
            title={metadata.title}
            description={metadata.description}
            keywords={metadata.keywords} /> }

        { flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} /> }

        <main>
            {children}

            <style global jsx>{`
                            :root {
                                --color-primary: blue;
                                --color-primary--contrast: white;
                                --color-error: red;
                                --color-error--contrast: white;
                                --color-warning: yellow;
                                --color-warning--contrast: black;
                            }
                            html {
                                font-size: 10px;
                                font-height: 1
                            }

                            body {
                                font-size: 1.6rem;
                            }
                        `}</style>
        </main>
    </Fragment>
)