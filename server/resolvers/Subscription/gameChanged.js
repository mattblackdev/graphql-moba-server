import { pubsub } from '/imports/api/pubsub'

export const gameChanged = {
  subscribe: () => pubsub.asyncIterator('gameChanged'),
}
