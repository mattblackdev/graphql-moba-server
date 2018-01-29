import { setup as createApolloServer } from 'meteor/swydo:ddp-apollo'
import { initAccounts } from 'meteor/nicolaslopezj:apollo-accounts'
import { loadSchema, getSchema } from 'graphql-loader'
import { makeExecutableSchema } from 'graphql-tools'
import cors from 'cors'
import typeDefs from './schema'
import resolvers from './resolvers'
import seed from './seed'

seed()

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
  {
    schema,
  },
  {
    configServer(graphQLServer) {
      graphQLServer.use(cors())
    },
    graphiql: true,
  },
)
