import gql from 'graphql-tag'
import { getFromLocalStorage } from '../lib/localStorage'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    extend type Query {
        hasCart: Boolean!
        cartId: String!
    }

    extend type Cart {
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
    },

    Mutation: {
        resetCart: (_root, _variables, { cache }) => {
            cache.writeData({
                data: {
                    hasCart: false,
                    cartId: null,
                    cart: null,
                },
            })
        },
    },
}
