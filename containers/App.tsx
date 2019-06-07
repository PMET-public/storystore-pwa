import React, { FunctionComponent, Fragment } from 'react'
import { gql } from 'apollo-boost'
import { Query } from 'react-apollo'
import { getFullPageTitle } from '@app/lib/helpers'
import { DocumentMetadataProps } from '@app/components/DocumentMetadata'
import DocumentMetadata from '@app/components/DocumentMetadata'

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

const App: FunctionComponent<any> = ({ children, ...rest }) => (
    <Query query={APP_SHELL_QUERY} fetchPolicy="cache-first" errorPolicy="all">
        {({ loading, data: {
            // flashMessage,
            storeConfig: {
                title_prefix,
                title_suffix,
                default_title,
                default_description,
                default_keywords,
            }
        } }: any) => {
            const metadata: DocumentMetadataProps = {
                title: getFullPageTitle([title_prefix, default_title, title_suffix]),
                description: default_description,
                keywords: default_keywords,
            }

            if (loading) return '⏲Loading...'
            return (
                <Fragment>
                    <DocumentMetadata {...metadata} />
                    {children}
                </Fragment>
            )
        }}
    </Query>
)

export default App