// import gql from 'graphql-tag'
import { getFullPageTitle } from '../lib/helpers'
import { gql } from 'apollo-boost'
// import { Query } from 'react-apollo'

import Query from './Query'
import DocumentMetadata from './DocumentMetadata'
import FlashMessage from './FlashMessage'

const APP_SHELL_QUERY = gql`
    query AppShell {
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

const App = ({ children }) => (
    <Query query={APP_SHELL_QUERY} fetchPolicy="cache-first">
        {({ 
            flashMessage,

            storeConfig: {
                default_description: description,
                default_keywords: keywords,
                default_title: title,
                title_prefix: titlePrefix,
                title_suffix: titleSuffix,
            } 
        }) => <>

                <DocumentMetadata
                    title={getFullPageTitle([titlePrefix, title, titleSuffix])}
                    description={description}
                    keywords={keywords} />
        
                { flashMessage && <FlashMessage {...flashMessage} /> }

                <main>
                    <h2>{description}</h2>
                    {children}
                </main>

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
            </>
        }

    </Query>
)

export default App