import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
  extend type Query {
    ui: [UI]!
  }

  extend type UI {
    isNavOpen: Boolean!
    isLoggedIn: Boolean!
    flashMessage: [FlashMessage]!
  }

  extend type FlashMessage {
      type: String!
      text: String!
      isActive: Boolean!
  }
`

/**
 * Default values on application load
 */
export const initialStore = {
    ui: {
        __typename: 'UI',
        isNavOpen: false,
        isLoggedIn: false,
        flashMessage: {
            __typename: 'FlashMessage',
            type: 'warning',
            text: 'This is drill. I repeat, this is a drill.',
            isActive: true
        }
    }
}

/**
 * Mutations 
 */
export const resolvers = {
    Mutation: {
        clearFlashMessage: (_root, variables, { cache, getCacheKey }) => {
            console.log('uh?')
            return null
        }
    }
}