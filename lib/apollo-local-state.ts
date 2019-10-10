import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    extend type Query {
        hasCart: Boolean!
        cartId: String!
        cartCount: Int!
        isOnline: Boolean!
    }
`

/**
 * Default values on application load
 */
export const defaults = {
    isOnline: false,
    cartId: '',
}

/**
 * Resolvers
 */

type Resolvers = {
    [key: string]: {
        [method: string]: (...args: any) => any
    }
}

export const resolvers: Resolvers = {
    Query: {
        cartCount: () => 1,
        hasCart: (_root, _variables, { cache }) => {
            const GET_CART_ID = gql`
                query CartId {
                    cartId @client
                }
            `

            const { cartId } = cache.readQuery({ query: GET_CART_ID })

            return !!cartId
        },
    },
    Mutation: {},
}
