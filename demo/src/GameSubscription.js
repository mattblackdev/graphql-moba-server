import { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const GAME_QUERY = gql`
  query {
    game {
      _id
      name
    }
  }
`

const GAME_SUBSCRIPTION = gql`
  subscription onGameChanged {
    gameChanged {
      _id
      name
    }
  }
`

const withData = graphql(GAME_QUERY, {
  name: 'game',
  props: props => ({
    ...props,
    subscribeToGameChanges: () =>
      props.game.subscribeToMore({
        document: GAME_SUBSCRIPTION,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData) {
            return prev
          }
          return { game: subscriptionData.data.gameChanged }
        },
      }),
  }),
})

class GameSubscription extends Component {
  componentWillMount() {
    this.props.subscribeToGameChanges()
  }

  render() {
    const { children, ...rest } = this.props
    return children({ ...rest })
  }
}

export default withData(GameSubscription)
