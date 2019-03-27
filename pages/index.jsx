import App from '../components/App'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const query = gql`
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
    <Query query={query} variables={{ id: 2 }}>
        {({ loading, error, data: { category: { children } } }) => (
            <App>
                <div className="title">Hello World! <span className="wave">👋</span></div>

                <div>Error: {(error || false).toString()}</div>
                <div>Loading: {(loading || false).toString()}</div>
                <div>Count: {children.length}</div>

                <ul>
                    {children.map((category) => (
                        <li key={category.id}>{category.name} | {category.url_path}</li>
                    ))}
                </ul>

                <style jsx>{`
                    .title {
                        font-size: 3em;
                    }
                    .wave {
                        font-size: 200%;
                    }
                `}</style>
            </App>
        )}
    </Query>
)

export default Index