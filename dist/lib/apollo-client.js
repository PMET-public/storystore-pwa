"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
var apollo_boost_1 = require("apollo-boost");
var apollo_link_state_1 = require("./apollo-link-state");
var apollo_link_1 = require("apollo-link");
var apollo_link_error_1 = require("apollo-link-error");
var isBrowser = typeof window !== 'undefined';
exports.uri = isBrowser ? '/graphql' : (process.env.MAGENTO_GRAPHQL_URL || '');
// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
    global.fetch = isomorphic_unfetch_1["default"];
}
exports.apolloClient = null;
function create(initialState) {
    var cache = new apollo_boost_1.InMemoryCache().restore(initialState || {});
    // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
    var client = new apollo_boost_1.ApolloClient({
        cache: cache,
        ssrMode: !isBrowser,
        connectToDevTools: isBrowser,
        link: apollo_link_1.ApolloLink.from([
            apollo_link_error_1.onError(function (_a) {
                var graphQLErrors = _a.graphQLErrors, networkError = _a.networkError;
                if (graphQLErrors) {
                    graphQLErrors.forEach(function (_a) {
                        var message = _a.message, locations = _a.locations, path = _a.path;
                        console.info("[GraphQL error]: Message: " + message + ", Location: " + locations + ", Path: " + path);
                    });
                }
                if (networkError)
                    console.info("[Network error]: " + networkError);
            }),
            new apollo_boost_1.HttpLink({ uri: exports.uri }),
        ]),
        typeDefs: apollo_link_state_1.typeDefs,
        resolvers: apollo_link_state_1.resolvers
    });
    cache.writeData({ data: __assign({}, apollo_link_state_1.defaults) });
    return client;
}
function initApollo(initialState) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!isBrowser)
        return create(initialState);
    // Reuse client on the client-side
    if (!exports.apolloClient) {
        exports.apolloClient = create(initialState);
    }
    // Attach Apollo Client to the Dev Tools
    // https://github.com/apollographql/apollo-client-devtools#configuration
    window.__APOLLO_CLIENT__ = exports.apolloClient;
    return exports.apolloClient;
}
exports["default"] = initApollo;
