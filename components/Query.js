import { Query as _Query } from 'react-apollo'

const Query = ({ children, ...props }) => (
    <_Query {...props}>
        {({ loading, error, data }) => {
            if (loading) { return 'loading' }
            if (error) return `Error!: ${error.message}`
            console.log({ ...props, data })
            return children(data)
        }}
    </_Query>
)

export default Query