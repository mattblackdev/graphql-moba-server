import { Meteor } from 'meteor/meteor'
import { Classes, Skills, Items, Games } from '/imports/api/collections'
import { Game, Team, Player, Class } from '/imports/api/classes'
import Ratings from '/imports/api/ratings'
import percentChance from '/imports/utils/percentChance'
import { pubsub } from '/imports/api/pubsub'

const skills = [
  {
    _id: 'bruiserBash',
    name: 'Bruiser Bash',
    classIds: ['warrior'], // reference
    description: 'Bashes a single foe',
    cooldown: 5,
  },
  {
    _id: 'giantShield',
    name: 'Giant Shield',
    classIds: ['warrior'], // reference
    description: 'Protects you or an ally from the next received attack',
    cooldown: 30,
  },
  {
    _id: 'swiftSlice',
    name: 'Swift Slice',
    classIds: ['ninja'], // reference
    description: 'Slice and dice an opponent',
    cooldown: 5,
  },
]

const classes = [
  {
    _id: 'warrior',
    name: 'Warrior',
    description: 'The humble yet mighty, mighty tank.',
    skillIds: ['bruiserBash', 'giantShield'], // reference
    health: Ratings.SPECTACULAR,
    attack: Ratings.DECENT,
    defense: Ratings.GREAT,
    speed: Ratings.POOR,
  },
  {
    _id: 'ninja',
    name: 'Ninja',
    description: 'I guess ninjas are stealthy assassins',
    skillIds: ['swiftSlice'], // reference
    health: Ratings.POOR,
    attack: Ratings.SPECTACULAR,
    defense: Ratings.DECENT,
    speed: Ratings.SPECTACULAR,
  },
]

function upsert(docs, Collection) {
  let numberAffected = 0
  docs.forEach(doc => {
    const result = Collection.upsert(doc._id, { $set: doc })
    numberAffected += result.numberAffected
  })
  if (numberAffected > 0) {
    console.log(`number affected: ${numberAffected}`)
  }
}
export default () => {
  console.log('seeding classes...')
  upsert(classes, Classes)
  console.log('seeding skills...')
  upsert(skills, Skills)
  console.log('seeding game...')
  Games.remove({})
  const joeshmoe = Meteor.users.findOne({ username: 'joeshmoe' })
  const game = new Game({
    name: 'Seed Game',
    duration: 30,
    ownerId: joeshmoe._id,
  })
  const redTeam = new Team({ color: 'red', ownerId: joeshmoe._id })
  const blueTeam = new Team({ color: 'blue', ownerId: joeshmoe._id })
  game.teams.push(redTeam)
  game.teams.push(blueTeam)
  game.players = Meteor.users
    .find({})
    .fetch()
    .map(
      user =>
        new Player({
          _id: user._id,
          teamId: percentChance(50) ? redTeam._id : blueTeam._id,
          class: classes[percentChance(50) ? 0 : 1],
          name: user.username,
        })
    )
  game.save()
  const gameId = game._id
  const usersAffected = Meteor.users.update(
    {},
    { $set: { gameId } },
    { multi: true }
  )
  console.log('users affected: ', usersAffected)
  // game.start() // Meteor method
  Meteor.setInterval(() => {
    // console.log('publishing game change')
    pubsub.publish('gameChanged', { gameChanged: game })
  }, 5000)
}
