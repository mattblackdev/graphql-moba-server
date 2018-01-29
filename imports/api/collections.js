import { Mongo } from 'meteor/mongo'

export const Items = new Mongo.Collection('items')
export const Players = new Mongo.Collection('players')
export const Classes = new Mongo.Collection('classes')
export const Games = new Mongo.Collection('games')
