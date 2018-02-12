import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as Astro from 'meteor/jagi:astronomy'
import { Roles } from 'meteor/alanning:roles'
import { DDP } from 'meteor/ddp-client'

import { Games, Classes, Skills } from './collections'

function getUserId() {
  // eslint-disable-next-line no-underscore-dangle
  return DDP._CurrentInvocation.get().userId
}

const idField = {
  type: String,
  default: () => new Mongo.ObjectID().valueOf(),
}

export const Rating = Astro.Enum.create({
  name: 'Rating',
  identifiers: {
    TERRIBLE: 'TERRIBLE',
    POOR: 'POOR',
    DECENT: 'DECENT',
    GREAT: 'GREAT',
    SPECTACULAR: 'SPECTACULAR',
  },
})

export const Skill = Astro.Class.create({
  name: 'Skill',
  collection: Skills,
  fields: {
    _id: String,
    name: String,
    description: String,
    classIds: [String],
    cooldown: Number,
  },
})

export const Class = Astro.Class.create({
  name: 'Class',
  collection: Classes,
  fields: {
    _id: String,
    name: String,
    description: String,
    skillIds: [String], // ref
    health: Rating,
    attack: Rating,
    defense: Rating,
    speed: Rating,
  },
})

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
    secret: {
      type: String,
      optional: true,
    },
    teamId: {
      type: String,
      optional: true,
    },
    class: {
      type: Class,
      optional: true,
    },
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
  helpers: {
    getUser() {
      return Meteor.users.findOne(this._id)
    },
  },
})

export const Location = Astro.Class.create({
  name: 'Location',
  fields: {
    _id: idField,
    name: {
      type: String,
      optional: true,
    },
    playerIds: {
      type: [String],
      default: () => [],
    },
  },
})

const Base = Astro.Class.create({
  name: 'Base',
  fields: {
    _id: idField,
    location: {
      type: String,
      optional: true,
    },
    health: {
      type: Number,
      default: 100,
    },
  },
})

const Team = Astro.Class.create({
  name: 'Team',
  fields: {
    _id: idField,
    color: String,
    base: {
      type: Base,
      default: () => new Base(),
    },
  },
})

export const GameStatus = Astro.Enum.create({
  name: 'Game Status',
  identifiers: {
    WAITING: 'WAITING',
    STARTED: 'STARTED',
    FINISHED: 'FINISHED',
  },
})

export const Game = Astro.Class.create({
  name: 'Game',
  collection: Games,
  fields: {
    name: { type: String, default: 'New Game' },
    teams: { type: [Team], default: () => [] },
    players: { type: [Player], default: () => [] },
    duration: { type: Number, default: 30 },
    startTime: { type: Date, optional: true },
    endTime: { type: Date, optional: true },
    locations: { type: [String], default: () => [] }, // FK
  },
  helpers: {
    getStatus() {
      if (!this.startTime) {
        return GameStatus.WAITING
      } else if (!this.endTime) {
        return GameStatus.STARTED
      }
      return GameStatus.FINISHED
    },
    isLocked() {
      return !!this.startTime
    },
    throwIfLocked(operationName) {
      if (this.isLocked()) {
        throw new Meteor.Error(
          'NOOP',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because it has already started.`
        )
      }
    },
    playersInLobby() {
      return this.players.filter(player => !player.teamId)
    },
    playersOnTeam(teamId) {
      return this.players.filter(player => player.teamId === teamId)
    },
    getUserPlayer() {
      return this.players.find(player => player._id === Meteor.userId())
    },
    getTeam(teamId) {
      const team = this.teams.find(t => teamId === t._id)
      if (!team) {
        throw new Error(`Could not find team: ${teamId} for game: ${this._id}`)
      }
      return team
    },
    getPlayer(userId) {
      const player = this.players.find(p => p._id === userId)
      if (!player) throw new Error(`User is not a player of game ${this._id}`)
      return player
    },
  },
  meteorMethods: {
    create(name, duration) {
      if (name) this.name = name
      if (duration) this.duration = duration
      return this.save()
    },
    start() {
      this.throwIfLocked('Start game')
      // create locations
      this.players.forEach(player => {
        if (!player.teamId || !player.class) {
          throw new Meteor.Error('NOOP', 'Players not ready')
        }
        player.secret = `${player._id}${new Mongo.ObjectID().valueOf()}`
      })
      this.startTime = new Date()
      return this.save()
    },
    join() {
      this.throwIfLocked('Join game')
      const userId = getUserId()
      Meteor.users.update(userId, { $set: { gameId: this._id } })
      this.players.push(new Player({ _id: userId }))
      return this.save()
    },
    addTeam(color) {
      this.throwIfLocked('Add team')
      const team = new Team({ color })
      this.teams.push(team)
      return this.save()
    },
    joinTeam(teamId) {
      this.getTeam(teamId) // check team exists on this game
      this.throwIfLocked('Join team')
      let player = this.getUserPlayer()
      if (!player) {
        const userId = getUserId()
        Meteor.users.update(userId, { $set: { gameId: this._id } })
        player = new Player({ _id: userId, teamId })
        this.players.push(player)
      } else {
        player.teamId = teamId
      }
      return this.save()
    },
    leaveTeam() {
      const player = this.getUserPlayer()
      player.teamId = null
      return this.save()
    },
    disbandTeam(teamId) {
      this.getTeam(teamId) // check team exists on this game
      // if (this.isLocked()) {
      //   team.setForfeit()
      // }
      this.playersOnTeam(teamId).forEach(player => {
        player.teamId = null
      })
      this.teams = this.teams.filter(team => team._id !== teamId)
      return this.save()
    },
    leaveGame() {
      const userId = getUserId()
      this.getPlayer(userId) // check player exists on this game
      // if (this.isLocked()) {
      //   player.setForfeit()
      // }
      this.players = this.players.filter(p => p._id !== userId)
      Meteor.users.update(userId, { $set: { gameId: null } })
      this.save()
    },
    setClass(clazzId) {
      const player = this.getUserPlayer()
      player.class = Class.findOne(clazzId)
      return this.save()
    },
  },
})
