import { Query as _Query } from 'react-apollo'

const Query = ({ children, ...props }) => (
    <_Query {...props}>
        {({ loading, error, data }, client) => {
            if (loading) { return 'loading' }
            if (error) return `Error!: ${error.message}`
            console.log('client', client)
            return children(data)
        }}
    </_Query>
)

export default Query