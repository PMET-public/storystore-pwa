import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    type NetworkStatus {
        isConnected: Boolean!
    }

    enum FlashMessageType {
        error,
        warning,
        info
    }

    type FlashMessage {
        type: FlashMessageType!
        message: String!
    }

    extend type Query {
        networkStatus: [NetworkStatus]!
        flashMessage: [FlashMessage]!
    }

    extend type Mutation {
        setFlashMessage(message: String!, type: String!): Boolean
    }
`

/**
 * Default values on application load
 */
export const defaults = {

    networkStatus: {
        __typename: 'NetworkStatus',
        isConnected: false
    },

    flashMessage: {
        __typename: 'FlashMessage',
        type: 'warning',
        message: 'This is drill. I repeat, this is a drill.',
    }

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
    Mutation: {
        updateNetworkStatus: (_, networkStatus: { isConnected: boolean }, { cache }) => {
            cache.writeData({ data: networkStatus })
            return null
        },

        setFlashMessage: (_, flashMessage: { message: string, type: string } | null, { cache }) => {
            cache.writeData({ data: flashMessage })
            return null
        }
    }
}

