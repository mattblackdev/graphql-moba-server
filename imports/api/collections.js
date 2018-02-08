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
