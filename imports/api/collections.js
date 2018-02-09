import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

function c(name) {
  return new Mongo.Collection(name)
}

export const Games = c('games')
export const Players = c('players')
export const Classes = c('classes')
export const Skills = c('skills')
export const Items = c('items')
export const Locations = c('locations')

if (Meteor.isServer) {
  Meteor.startup(() => {
    Meteor.publish('allGames', function() {
      return Games.find({})
    })
  })
}
