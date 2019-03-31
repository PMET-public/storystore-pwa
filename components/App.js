import gql from 'graphql-tag'
import DocumentMetadata from './DocumentMetadata'
import { getFullPageTitle } from '../lib/helpers'
import FlashMessage from './FlashMessage'
import Query from './Query'

const GET_STORE_CONFIG_QUERY = gql`
    query {
    
        flashMessage @client {
            message
            type
        }
    
        storeConfig {            
            copyright
            default_description
            default_display_currency_code
            default_keywords
            default_title
            header_logo_src
            logo_alt
            secure_base_link_url
            secure_base_media_url
            secure_base_static_url
            secure_base_url
            show_cms_breadcrumbs
            timezone
            title_prefix
            title_suffix
            website_id
            weight_unit
            welcome
        }
    }
`

const FLASH_MESSAGE_MUTATION = gql`
    mutation {
        clearFlashMessage @client
        setFlashMessage @client
    }
`;


const App = ({ children }) => (
    <Query query={GET_STORE_CONFIG_QUERY} fetchPolicy="cache-first">
        {({
            flashMessage,

            storeConfig: {
                default_title: title,
                default_description: description,
                default_keywords: keywords,
                title_prefix: titlePrefix,
                title_suffix: titleSuffix
            }
        }) => <>
                <DocumentMetadata
                    title={getFullPageTitle([titlePrefix, title, titleSuffix])}
                    description={description}
                    keywords={keywords} />

                <FlashMessage
                    message={flashMessage.message}
                    type={flashMessage.type}
                     />


                <main>{children}</main>

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