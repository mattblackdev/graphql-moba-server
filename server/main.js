import { Meteor } from 'meteor/meteor'
import { createApolloServer } from 'meteor/apollo'
import { initAccounts } from 'meteor/nicolaslopezj:apollo-accounts'
import { loadSchema, getSchema } from 'graphql-loader'
import { makeExecutableSchema } from 'graphql-tools'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { WebApp } from 'meteor/webapp'
import { execute, subscribe } from 'graphql'
import cors from 'cors'

import '/imports/api/collections'
import { Game } from '/imports/api/classes'

import typeDefs from './schema'
import resolvers from './resolvers'
import './seed'

// Load all accounts related resolvers and type definitions into graphql-loader
initAccounts({
  loginWithFacebook: false,
  loginWithGoogle: false,
  loginWithLinkedIn: false,
  loginWithPassword: true,
})

// Load all your resolvers and type definitions into graphql-loader
loadSchema({ typeDefs, resolvers })

// Gets all the resolvers and type definitions loaded in graphql-loader
const schema = makeExecutableSchema(getSchema())

createApolloServer(
  req => {
    let context = {}
    const playerToken = req.headers['player-token']
    if (playerToken && playerToken.length > 17) {
      const userId = playerToken.substring(0, 17)
      const user = Meteor.users.findOne(userId)
      const game = user ? Game.findOne(user.gameId) : null
      const player = game ? game.players.find(p => p._id === userId) : null
      if (user) {
        context = {
          user,
          userId,
          player,
          game,
        }
        console.log('context', context)
      }
    }
    return {
      schema,
      context,
    }
  },
  {
    configServer(graphQLServer) {
      graphQLServer.use(cors())
    },
    graphiql: true,
  }
)

const subscriptionServer = new SubscriptionServer(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server: WebApp.httpServer,
    path: '/subscriptions',
  }
)
