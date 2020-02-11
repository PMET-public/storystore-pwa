import gql from 'graphql-tag'
import { getFromLocalStorage } from '../lib/localStorage'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    extend type Query {
        hasCart: Boolean!
        cartId: String!
        braintreeToken: String!
    }
`

/**
 * Default values on application load
 */
export const defaults = {
    cartId: (process.browser && getFromLocalStorage('cartId')) || '',
    hasCart: process.browser && !!getFromLocalStorage('cartId'),
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
        cartId() {
            const cartId = (process.browser && getFromLocalStorage('cartId')) || ''
            return cartId
        },
        hasCart() {
            const cartId = process.browser && getFromLocalStorage('cartId')
            return process.browser && !!cartId
        },
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
