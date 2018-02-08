import { Classes, Skills, Items } from '/imports/api/collections'
import Ratings from '/imports/api/ratings'

const skills = [
  {
    _id: 'bruiserBash',
    name: 'Bruiser Bash',
    classes: ['warrior'], // reference
    description: 'Bashes a single foe',
    cooldown: 5,
  },
]

const classes = [
  {
    _id: 'warrior',
    name: 'Warrior',
    description: 'Mighty, tank-y and mighty tank-y.',
    skills: ['bruiserBash'], // reference
    health: Ratings.SPECTACULAR,
    attack: Ratings.DECENT,
    defense: Ratings.GREAT,
    speed: Ratings.POOR,
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
}
