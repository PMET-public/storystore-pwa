import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    # flashMessage: [FlashMessage]

    extend type FlashMessage {
        type: String!
        message: String!
    }
`

/**
 * Default values on application load
 */
export const defaultState = {
    flashMessage: {
        __typename: 'FlashMessage',
        type: 'warning',
        message: 'This is drill. I repeat, this is a drill.',
    }

}

/**
 * Mutations 
 */
export const resolvers = {
    Mutation: {
        setFlashMessage: (_root, { message, type }, { cache }) => {
            const data = {
                flashMessage: { message, type }
            }
            cache.writeData({ data })
            debugger
            return null
        }
    }
}