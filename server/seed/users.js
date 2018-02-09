import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'

export default () => {
  console.log('seeding users...')
  // Meteor.users.remove({})
  const users = [
    {
      email: 'mb@mattblack.io',
      password: 'password',
      username: 'mb',
      roles: ['admin'],
    },
    {
      username: 'joeshmoe',
      password: 'password',
    },
  ]

  users.forEach(user => {
    const userExists = Meteor.users.findOne({ username: user.username })
    if (userExists) return

    console.log(`insert user: ${user.username}`)
    const userId = Accounts.createUser(user)
    if (user.roles) {
      console.log('adding roles', user.roles)
      Roles.addUsersToRoles(userId, user.roles, 'default-group')
    }
    if (user.email) {
      Meteor.users.update(userId, { $set: { 'emails.0.verified': true } })
    }
  })
}
