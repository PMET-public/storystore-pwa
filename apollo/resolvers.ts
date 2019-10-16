import gql from 'graphql-tag'
import { getFromLocalStorage } from '../lib/localStorage'
import { getTotalCartQuantity } from '../lib/getTotalCartQuantity'

/**
 * Extending the types of our server schema
 */
export const typeDefs = gql`
    extend type Query {
        hasCart: Boolean!
        cartId: String!
        isOnline: Boolean!
    }

    extend type Cart {
        totalQuantity: Int!
    }
`

/**
 * Default values on application load
 */
export const defaults = {
    cartId: (process.browser && getFromLocalStorage('cartId')) || '',
    hasCart: process.browser && !!getFromLocalStorage('cartId'),
    isOnline: true,
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
    Cart: {
        totalQuantity({ items }) {
            // ☝️ TO-DO: Remove once total_quantity is released
            return items ? getTotalCartQuantity(items) : 0
        },
    },
    Mutation: {},
}
