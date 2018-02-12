import React, { Component } from 'react'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider } from 'react-apollo'

import GameSubscription from './GameSubscription'

const mySecret = process.env.REACT_APP_PLAYER_TOKEN

// This link puts your secret on every graphql request as an http header
const playerTokenLink = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    headers: {
      'player-token': mySecret,
    },
  }))

  return forward(operation)
})

// This is the main http link for graphql requests
const httpLink = new HttpLink({ uri: 'http://localhost:3000/graphql' })

// This is the subscription link
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split subscription
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink, // If above condition is true, apollo will use the subscription link
  playerTokenLink.concat(httpLink) // Else it uses the combined playerTokenLink & httpLink
)

// This is the apollo client that we pass to <ApolloProvider />
const client = new ApolloClient({
  link, // here's the link we created above
  cache: new InMemoryCache(), // The cache is where apollo will store our data
})

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <GameSubscription>
          {renderProps => <pre>{JSON.stringify(renderProps, null, 2)}</pre>}
        </GameSubscription>
      </ApolloProvider>
    )
  }
}

export default App
