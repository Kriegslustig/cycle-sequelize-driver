import { Observable as O } from 'rx'
import { Map } from 'immutable'

import { defineKey, createDefinitions, executeDefinitions } from './lib/define'

export { createDefinitions as define }

export function makeSequelizeDriver (sequelize) {
  let state = Map({
    sequelize,
    model: Map()
  })
  return (input$) =>
    O.create((observer) => {
      input$.subscribe(([key, ...args]) => {
        switch (key) {
          case defineKey:
            executeDefinitions(sequelize, args).subscribe(
              (models) => { state = state.merge(models) },
              (err) => observer.onError(err),
              () => { observer.onNext(state) }
            )
        }
      })
    })
}

