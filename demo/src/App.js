import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloProvider, graphql } from 'react-apollo'
import gql from 'graphql-tag'

const query = gql`
  query {
    me {
      _id
    }
  }  
`

const mySecret = '5PR2NgoWLfWdqwpCHfd45a023ace7d2d565f2e163'
// Puts your secret on every graphql request
export const playerLink = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    headers: {
      'player-token': mySecret,
    },
  }))

  return forward(operation)
})

const client = new ApolloClient({
  link: playerLink.concat(
    new HttpLink({ uri: 'http://localhost:3000/graphql' })
  ), // Talk to the backend
  cache: new InMemoryCache(),
})

const Query = graphql(query)(props => {
  return <pre>{JSON.stringify(props, null, 2)}</pre>
})

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Query />
      </ApolloProvider>
    )
  }
}

export default App
