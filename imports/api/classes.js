import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import * as Astro from 'meteor/jagi:astronomy'
import { DDP } from 'meteor/ddp-client'

import { Games, Classes, Skills } from './collections'
import userIsAdmin from './userIsAdmin'

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

export const Player = Astro.Class.create({
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

export const Base = Astro.Class.create({
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

export const Team = Astro.Class.create({
  name: 'Team',
  fields: {
    _id: idField,
    color: String,
    base: {
      type: Base,
      default: () => new Base(),
    },
    ownerId: String, // FK to userId who created the game
  },
  helpers: {
    throwIfNotOwner(operationName) {
      if (this.ownerId !== getUserId()) {
        throw new Meteor.Error(
          'NOOP',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because you are not the owner.`
        )
      }
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
    ownerId: String, // FK to userId who created the game
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
    throwIfNotLocked(operationName) {
      if (!this.isLocked()) {
        throw new Meteor.Error(
          'NOOP',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because it has not started.`
        )
      }
    },
    throwIfNotOwnerOrAdmin(operationName) {
      if (userIsAdmin()) return
      if (this.ownerId !== getUserId()) {
        throw new Meteor.Error(
          'NOT_AUTHORIZED',
          `Operation: ${operationName} can not be performed on game: ${
            this.name
          } ${this._id} because you are not the owner.`
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
      return this.teams.find(t => teamId === t._id)
    },
    getPlayer(userId) {
      return this.players.find(p => p._id === userId)
    },
  },
  meteorMethods: {
    create(name, duration) {
      console.log('create', name)
      if (name) this.name = name
      if (duration) this.duration = duration
      this.ownerId = getUserId()
      return this.save()
    },
    start() {
      this.throwIfLocked('Start game')
      this.throwIfNotOwnerOrAdmin('Start game')
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
    stop() {
      this.throwIfNotLocked('Stop game')
      this.throwIfNotOwnerOrAdmin('Stop game')
      this.endTime = new Date()
      return this.save()
    },
    addTeam(color) {
      this.throwIfLocked('Add team')
      const team = new Team({ color, ownerId: getUserId() })
      this.teams.push(team)
      this.save()
      return this.joinTeam(team._id)
    },
    joinTeam(teamId) {
      this.getTeam(teamId) // check team exists on this game
      this.throwIfLocked('Join team')
      let player = this.getUserPlayer()
      if (player) {
        player.teamId = teamId
      } else {
        const user = Meteor.user()
        if (!user) {
          throw new Meteor.Error('NOT_AUTHORIZED', 'User is not logged in.')
        }
        if (user.gameId) {
          // User is in a game already. Remove them.
          const currentGame = Game.findOne(user.gameId)
          if (currentGame) {
            try {
              currentGame.leaveTeam()
            } catch (e) {
              // do nothing
            }
          }
        }
        Meteor.users.update(user._id, { $set: { gameId: this._id } })
        player = new Player({ _id: user._id, teamId })
        this.players.push(player)
      }
      return this.save()
    },
    leaveGame() {
      const player = this.getUserPlayer()
      if (!player) {
        throw new Meteor.Error(
          'NOOP',
          `There is not a player in game: ${
            this.name
          } for user ${Meteor.userId()}`
        )
      }
      this.players.splice(this.players.indexOf(player), 1)
      Meteor.users.update(player._id, { $set: { gameId: null } })
      return this.save()
    },
    setClass(clazzId) {
      const player = this.getUserPlayer()
      player.class = Class.findOne(clazzId)
      return this.save()
    },
  },
})
