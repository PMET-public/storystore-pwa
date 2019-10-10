import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    extend type Query {
        cartCount: Int!
        isOnline: Boolean!
    }
`

/**
 * Default values on application load
 */
export const defaults = {
    cartCount: 0,
    isOnline: true,
}

/**
 * Resolvers
 */
type Resolvers = {
    Mutation: {
        [mutation: string]: (_: any, data: any, props?: any) => null
    }
}

export const resolvers: Resolvers = {
    Mutation: {},
}
