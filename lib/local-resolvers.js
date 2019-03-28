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
  }
`

/**
 * Default values on application load
 */
export const initialStore = {
    ui: {
        __typename: 'UI',
        isNavOpen: false,
        isLoggedIn: false
    }
}


export const resolvers = {

}