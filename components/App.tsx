// import gql from 'graphql-tag'
import { getFullPageTitle } from '../lib/helpers'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'

import DocumentMetadata from './DocumentMetadata'
import FlashMessage from './FlashMessage'
import { NextFunctionComponent } from 'next'
import { Fragment } from 'react'

const APP_SHELL_QUERY = gql`
    query AppShellQuery {
        # flashMessage @client {
        #     type
        #     message
        # }
        storeConfig {
            __typename
            default_title
        }
    }
    
`

const App: NextFunctionComponent = ({ children }) => (
    <Query query={APP_SHELL_QUERY} fetchPolicy="cache-first" errorPolicy="all">
        {({
            loading,
            error,
            data
        }: any) => {
            if (loading) return '⏲Loading...'
            if (error) return `⚠️ ${error.message}`
            console.log({ loading, error, data })
            return null
            return (
                <Fragment>
                    <DocumentMetadata
                        title={getFullPageTitle([title_prefix, default_title, title_suffix])}
                        description={default_description}
                        keywords={default_keywords} />

                    {flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} />}

                    <main>
                        <h2>{default_description}</h2>
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