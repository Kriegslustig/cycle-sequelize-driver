import { BehaviorSubject, Observable as O } from 'rx'
import { Map } from 'immutable'
import { initFindOne } from './findOne'
import createFindCache from './findCache'

export const defineKey = Symbol.for('sequelize define action')

export function define (...args) {
  return [
    defineKey,
    ...[(
      typeof args[0] === 'string'
        ? [...args]
        : args
    )]
  ]
}

export function executeDefinitions (sequelize, definitions) {
  const models = definitions
    .reduce((m, [name, opts]) => {
      const change$ = new BehaviorSubject()
      const modelCache = createFindCache(change$)
      return (m
        .set(name, sequelize.define(name, opts, {
          afterCreate: () => change$.onNext(name),
          afterDestroy: () => change$.onNext(name),
          afterUpdate: () => change$.onNext(name)
        }))
        .update(name, (model) => {
          model.__cycleCache = {
            findOne: initFindOne(modelCache, model),
            modelCache, change$
          }
          return model
        })
      )
    }, Map())
  return O.create((observer) => {
    Promise.all(...models.map((m) => m.sync()))
      .then((...createdModels) => {
        observer.onNext(
          createdModels.reduce(
            (state, [name, model]) =>
              state.set(name, model),
            Map()
          )
        )
        observer.onCompleted()
      })
      .catch((err) => observer.onError(err))
  })
}

