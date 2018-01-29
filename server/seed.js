import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { Items } from '/imports/api/collections'

export default () => {
  if (Items.find({}).count() === 0) {
    const items = [
      { name: 'Wooden Sword' },
      { name: 'Potion' },
      { name: 'Basic Armor' },
    ]

    items.forEach(enemy => {
      Items.insert(enemy)
    })
  }

  if (Meteor.users.find().count() === 0) {
    const users = [
      {
        email: 'mb@mattblack.io',
        password: 'password',
        firstname: 'Matt',
        lastname: 'Black',
        roles: ['admin'],
      },
    ]

    users.forEach(user => {
      console.log(`Add user ${user.email} to the database.`)

      const userId = Accounts.createUser({
        email: user.email,
        password: user.password,
        profile: {
          firstname: user.firstname,
          lastname: user.lastname,
          name: `${user.firstname} ${user.lastname}`,
        },
        roles: user.roles,
      })

      Meteor.users.update(userId, { $set: { 'emails.0.verified': true } })
    })
  }
}
