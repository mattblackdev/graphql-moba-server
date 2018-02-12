import { Meteor } from 'meteor/meteor'
import { createApolloServer } from 'meteor/apollo'
import { initAccounts } from 'meteor/nicolaslopezj:apollo-accounts'
import { loadSchema, getSchema } from 'graphql-loader'
import { makeExecutableSchema } from 'graphql-tools'
import cors from 'cors'
import typeDefs from './schema'
import resolvers from './resolvers'
import './seed'

import '/imports/api/collections'

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
    const playerToken = req.headers['player-token']
    const userId = playerToken.substring(0, 17)
    const user = Meteor.users.findOne(userId)
    return {
      schema,
      context: {
        userId: user._id,
        user,
      },
    }
  },
  {
    configServer(graphQLServer) {
      graphQLServer.use(cors())
    },
    graphiql: true,
  }
)
