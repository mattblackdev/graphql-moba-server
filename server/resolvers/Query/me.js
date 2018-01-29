import { Meteor } from 'meteor/meteor'

export function me(root, args, context) {
  // if the user is not logged in throw an error
  console.log('resolving me', root, args, context)
  if (!context.userId) {
    throw new Error('Unknown User (not logged in)')
  }
  // find the user using the userId from the context
  return Meteor.users.findOne(context.userId)
}
