import { Classes, Skills, Items, Games } from '/imports/api/collections'
import { Game } from '/imports/api/classes'
import Ratings from '/imports/api/ratings'

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
  const game = new Game()
  game.create('Test Game', 30, (err, result) => {
    console.log('results', err, result)
  })
}
