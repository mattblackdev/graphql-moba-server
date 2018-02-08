import { Games } from '/imports/api/collections'

export function games() {
  return Games.find()
    .fetch()
    .map(game => ({
      ...game,
    }))
}
