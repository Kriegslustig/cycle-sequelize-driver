import { Observable as O } from 'rx'

export function findOne (collection, selector) {
  return collection.__cycleCache.findOne(selector)
}

export function initFindOne (cache, collection) {
  return (selector) => {
    const execFindOne = () => O.fromPromise(collection.findOne(selector))
    return cache(execFindOne)
  }
}

export function executeFindOne () {}

