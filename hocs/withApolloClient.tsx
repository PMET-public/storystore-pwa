import { Component } from 'react'
import initApollo from '@app/lib/init-apollo'
import Head from 'next/head'
import { getDataFromTree } from 'react-apollo'

const isBrowser = typeof window !== 'undefined'

export default (App: any) => class Apollo extends Component {

  static displayName = 'withApollo(App)'
    apolloClient: any;

  static async getInitialProps(ctx: any) {
    const { Component, router } = ctx

    let appProps = {}
    if (App.getInitialProps) {
      appProps = await App.getInitialProps(ctx)
    }

    // Run all GraphQL queries in the component tree
    // and extract the resulting data
    const apollo = initApollo()
    if (!isBrowser) {
      try {
        // Run all GraphQL queries
        await getDataFromTree(
          <App
            {...appProps}
            Component={Component}
            router={router}
            apolloClient={apollo}
          />
        )
      } catch (error) {
        // Prevent Apollo Client GraphQL errors from crashing SSR.
        // Handle them in components via the data.error prop:
        // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
        console.error('Error while running `getDataFromTree`', error)
      }

      // getDataFromTree does not call componentWillUnmount
      // head side effect therefore need to be cleared manually
      Head.rewind()
    }

    // Extract query data from the Apollo store
    const apolloState = apollo.cache.extract()

    return {
      ...appProps,
      apolloState
    }
  }

  constructor(props: any) {
    super(props)
    this.apolloClient = initApollo(props.apolloState)
  }

  render() {
    return <App {...this.props} apolloClient={this.apolloClient} />
  }
}
