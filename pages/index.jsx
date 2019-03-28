import App from '../components/App'
import { Query, ApolloConsumer } from 'react-apollo'
import gql from 'graphql-tag'

const GET_CATEGORY_LIST_QUERY = gql`
    query categoryList($id: Int!) {
        category(id: $id) {
            id
            children {
                id
                name
                url_key
                url_path
                children_count
                path
                image
                productImagePreview: products(pageSize: 1) {
                    items {
                        small_image {
                            url
                        }
                    }
                }
            }
        }
    }
`

const Index = () => (
    <App>
        <div className="title">
            <span className="wave">👋🌍</span>
        </div>

        <style jsx>{`
            .title {
                font-size: 20vw;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `}</style>
    </App>
)

export default Index
