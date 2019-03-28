import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const GET_STORE_CONFIG_QUERY = gql`
    query {
        ui @client {
            isNavOpen
            isLoggedIn
        }

        storeConfig {
            absolute_footer
            base_currency_code
            base_link_url
            base_media_url
            base_static_url
            base_url
            cms_home_page
            cms_no_cookies
            cms_no_route
            code
            copyright
            default_description
            default_display_currency_code
            default_keywords
            default_title
            demonotice
            front
            head_includes
            head_shortcut_icon
            header_logo_src
            id
            locale
            logo_alt
            logo_height
            logo_width
            no_route
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

const App = ({ children }) => (
    <Query query={GET_STORE_CONFIG_QUERY}>
        {({ loading, error, data }) => (
            <main>
                {children}
                
            </main>
        )}
    </Query>
)

export default App