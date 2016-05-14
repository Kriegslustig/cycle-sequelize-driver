import { Observable as O } from 'rx'
import { Map } from 'immutable'

export const defineKey = Symbol.for('sequelize define action')

export function createDefinitions (...args) {
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
    .reduce(
      (m, [name, ...args]) => m.set(name, sequelize.define(name, ...args)),
      Map()
    )
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

