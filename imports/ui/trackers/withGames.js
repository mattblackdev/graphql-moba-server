import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import { Roles } from 'meteor/alanning:roles'
import { Game } from '/imports/api/classes'

export default withTracker(({ user }) => {
  const gamesSub = Meteor.subscribe('allGames')
  const games = Game.find()
    .fetch()
    .sort((a, b) => {
      if (user && a._id === user.gameId) {
        return -1
      }
      if (user && b._id === user.gameId) {
        return 1
      }
      return a.startTime < b.startTime ? 1 : -1
    })
  let props = {}
  if (user) {
    // const players = Players.find({}).fetch()
    const admin = Roles.userIsInRole(user, ['admin'], 'default-group')
    props = {
      // players,
      admin,
      newGame: name => new Game().create(name),
    }
  }
  return {
    ...props,
    loggingIn: Meteor.loggingIn(),
    gamesReady: gamesSub.ready(),
    games,
  }
})
