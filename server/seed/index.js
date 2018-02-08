import { Meteor } from 'meteor/meteor'
import users from './users'
import games from './games'

Meteor.startup(() => {
  console.log('*** Seeding ***')
  users()
  games()
  console.log('*** Seeding Complete ***')
})
