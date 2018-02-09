import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as Astro from 'meteor/jagi:astronomy'
import { Roles } from 'meteor/alanning:roles'
import { DDP } from 'meteor/ddp-client'

import { Games, Classes } from './collections'

function getUserId() {
  // eslint-disable-next-line no-underscore-dangle
  return DDP._CurrentInvocation.get().userId
}

const idField = {
  type: String,
  default: () => new Mongo.ObjectID().valueOf(),
}

// const Class = Astro.Class.create({})

const zeroField = {
  type: Number,
  default: 0,
}

const statField = {
  type: Number,
  optional: true,
}

// const itemField = {
//   type: Item,
//   optional: true,
// }

const Player = Astro.Class.create({
  name: 'Player',
  fields: {
    _id: String,
    teamId: {
      type: String,
      optional: true,
    },
    // class: {
    //   type: Class,
    //   optional: true,
    // },
    // location: {
    //   type: Location,
    //   optional: true,
    // },
    xp: zeroField,
    level: {
      type: Number,
      default: 1,
    },
    health: statField,
    maxHealth: statField,
    attack: statField,
    defense: statField,
    speed: statField,
    kills: zeroField,
    gold: zeroField,
    // armor: itemField,
    // weapon: itemField,
    // potions: {
    //   type: [Item],
    //   default: () => [],
    // },
  },
})

const Team = Astro.Class.create({
  name: 'Team',
  fields: {
    _id: idField,
    color: String,
    // players: [Player],
    // base: {
    //   type: Base,
    //   optional: true,
    // },
    // kills: zeroField,
  },
})

// export const Location = Class.create({
//   name: 'Location',
//   collection
// })

export const Game = Astro.Class.create({
  name: 'Game',
  collection: Games,
  fields: {
    name: { type: String, default: 'New Game' },
    teams: { type: [Team], default: () => [] }, // FK
    players: { type: [Player], default: () => [] },
    duration: { type: Number, default: 30 },
    startTime: { type: Date, optional: true },
    endTime: { type: Date, optional: true },
    // locations: { type: [String], default: () => [] }, // FK
  },
  meteorMethods: {
    create(name, duration) {
      if (name) this.name = name
      if (duration) this.duration = duration
      return this.save()
    },
    start() {
      this.startTime = new Date()
      return this.save()
    },
    addTeam(color) {
      // const userId = getUserId()
      // const player = new Player({ _id: userId })
      const team = new Team({ color })
      this.teams.push(team)
      console.log('adding team', this)
      return this.save()
    },
  },
})
