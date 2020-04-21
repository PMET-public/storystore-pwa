import gql from 'graphql-tag'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    extend type Query {
        braintreeToken: String!
    }
`

/**
 * Default values on application load
 */
export const defaults = {}

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
        countries({ countries }) {
            /**
             * 🩹Patch:
             * return countries sorted by name
             * and filter empty values
             */

            if (!countries) return countries

            return countries
                .filter((x: any) => !!x.name)
                .sort(function compare(a: any, b: any) {
                    // Use toUpperCase() to ignore character casing
                    const genreA = a.name.toUpperCase()
                    const genreB = b.name.toUpperCase()

                    let comparison = 0
                    if (genreA > genreB) {
                        comparison = 1
                    } else if (genreA < genreB) {
                        comparison = -1
                    }
                    return comparison
                })
        },
    },

    Mutation: {},
}
