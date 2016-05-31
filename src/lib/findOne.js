import { Observable as O } from 'rx'

export function findOne (collection, selector) {
  return collection.__cycleCache.findOne(collection, selector)
}

export function initFindOne (cache, collection) {
  return (selector) => {
    const execFindOne = () => O.fromPromise(collection.findOne(selector))
    return execFindOne().merge(cache(execFindOne))
  }
}

export function executeFindOne () {}

