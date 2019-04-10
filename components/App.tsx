import { getFullPageTitle } from '../lib/helpers'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'

import DocumentMetadata from './DocumentMetadata'
import FlashMessage from './FlashMessage'
import { NextFunctionComponent } from 'next'
import { Fragment } from 'react'

const APP_SHELL_QUERY = gql`
    query AppShellQuery {
        flashMessage @client { 
            type
            message 
        }
        storeConfig {
            default_description
            default_keywords
            default_title
            title_prefix
            title_suffix
        }
    
    }
    
`

const App: NextFunctionComponent = ({ children }) => (
    <Query query={APP_SHELL_QUERY} fetchPolicy="cache-first" errorPolicy="all">
        {({ loading, error, data: { flashMessage, storeConfig } }: any) => {

            if (loading) return '⏲Loading...'

            return (
                <Fragment>
                    <DocumentMetadata
                        title={getFullPageTitle([storeConfig.title_prefix, storeConfig.default_title, storeConfig.title_suffix])}
                        description={storeConfig.default_description}
                        keywords={storeConfig.default_keywords} />

                    { flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} /> }

                    <main>
                        <h2>{storeConfig.default_title}</h2>
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
        }}
    </Query>
)

export default App