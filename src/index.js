const Sequelize = require('sequelize')
import { Observable as O } from 'rx'
import { Map } from 'immutable'

import { defineKey, define, executeDefinitions } from './lib/define'
import { createKey, create, executeCreates } from './lib/create'

export { define, create }

export function makeSequelizeDriver (sequelize) {
  if (!Sequelize.prototype.isPrototypeOf(sequelize)) throw Error('makeSequelizeDriver expects parameter 1 to be an instance of Sequelize')
  let state = Map({
    sequelize,
    model: Map()
  })
  return (input$) =>
    O.create((observer) => {
      input$.subscribe(
        ([key, ...args]) => {
          switch (key) {
            case defineKey:
              executeDefinitions(sequelize, args).subscribe(
                (models) => { state = state.merge(models) },
                (err) => observer.onError(err),
                () => { observer.onNext(state) }
              )
              break
            case createKey:
              executeCreates(state, ...args).subscribe(
                () => {},
                (err) => observer.onError(err),
                () => {}
              )
              break
            default:
              observer.onError(new Error(`Undefined operation: ${key}`))
          }
        },
        (err) => observer.onError(err)
      )
    })
}

