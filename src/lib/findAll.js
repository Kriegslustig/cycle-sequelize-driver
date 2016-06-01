import { Observable as O } from 'rx'

export function findAll (collection, selector) {
  return collection.__cycleCache.findAll(selector)
}

export function initFindAll (cache, collection) {
  return (selector) => {
    const execFindAll = () => O.fromPromise(collection.findAll(selector))
    return cache(execFindAll)
  }
}

export function executeFindAll () {}

