import { Observable as O } from 'rx'
import { Map } from 'immutable'

import { defineKey, createDefinitions, executeDefinitions } from './lib/define'
import { createKey, createCreates, executeCreates } from './lib/create'

export { createDefinitions as define }
export { createCreates as create }

export function makeSequelizeDriver (sequelize) {
  let state = Map({
    sequelize,
    model: Map()
  })
  return (input$) =>
    O.create((observer) => {
      console.log('Sub made')
      input$.subscribe(([key, ...args]) => {
        console.log(`executing ${key.toString()}`)
        switch (key) {
          case defineKey:
            executeDefinitions(sequelize, args).subscribe(
              (models) => { state = state.merge(models) },
              (err) => observer.onError(err),
              () => { observer.onNext(state) }
            )
            break
          case createKey:
            executeCreates(state).subscribe(
              () => {},
              (err) => observer.onError(err),
              () => {}
            )
            break
          default:
            observer.onError(new Error(`Undefined operation: ${key}`))
        }
      })
    })
}

