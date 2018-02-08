import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

export default () => {
  console.log('seeding users...')
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
    if (user.email) {
      Meteor.users.update(userId, { $set: { 'emails.0.verified': true } })
    }
  })
}
