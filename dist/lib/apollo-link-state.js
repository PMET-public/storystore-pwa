"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphql_tag_1 = __importDefault(require("graphql-tag"));
/**
 * Extending the types of our server schema
 */
exports.typeDefs = graphql_tag_1["default"](templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    type NetworkStatus {\n        isConnected: Boolean!\n    }\n\n    enum FlashMessageType {\n        error,\n        warning,\n        info\n    }\n\n    type FlashMessage {\n        type: FlashMessageType!\n        message: String!\n    }\n\n    extend type Query {\n        networkStatus: [NetworkStatus]!\n        flashMessage: [FlashMessage]!\n    }\n\n    extend type Mutation {\n        setFlashMessage(message: String!, type: String!): Boolean\n    }\n"], ["\n    type NetworkStatus {\n        isConnected: Boolean!\n    }\n\n    enum FlashMessageType {\n        error,\n        warning,\n        info\n    }\n\n    type FlashMessage {\n        type: FlashMessageType!\n        message: String!\n    }\n\n    extend type Query {\n        networkStatus: [NetworkStatus]!\n        flashMessage: [FlashMessage]!\n    }\n\n    extend type Mutation {\n        setFlashMessage(message: String!, type: String!): Boolean\n    }\n"
    /**
     * Default values on application load
     */
])));
/**
 * Default values on application load
 */
exports.defaults = {
    networkStatus: {
        __typename: 'NetworkStatus',
        isConnected: false
    },
    flashMessage: {
        __typename: 'FlashMessage',
        type: 'warning',
        message: 'This is drill. I repeat, this is a drill.'
    }
};
exports.resolvers = {
    Mutation: {
        updateNetworkStatus: function (_, networkStatus, _a) {
            var cache = _a.cache;
            cache.writeData({ data: networkStatus });
            return null;
        },
        setFlashMessage: function (_, flashMessage, _a) {
            var cache = _a.cache;
            cache.writeData({ data: flashMessage });
            return null;
        }
    }
};
var templateObject_1;
