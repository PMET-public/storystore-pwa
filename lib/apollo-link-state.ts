import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    type NetworkStatus {
        isConnected: Boolean!
    }

    extend type Query {
        networkStatus: [NetworkStatus]!
    }
`

/**
 * Default values on application load
 */
export const defaults = {
    networkStatus: {
        __typename: 'NetworkStatus',
        isConnected: false,
    },
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
    Mutation: { },
}
