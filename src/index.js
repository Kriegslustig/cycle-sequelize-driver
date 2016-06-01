const Sequelize = require('sequelize')
import { Observable as O } from 'rx'
import { Map } from 'immutable'

import { defineKey, define, executeDefinitions } from './lib/define'
import { createKey, create, executeCreates } from './lib/create'
import { findOne } from './lib/findOne'
import { findAll } from './lib/findAll'

export { define, create, findOne, findAll }

export function makeSequelizeDriver (sequelize) {
  if (!Sequelize.prototype.isPrototypeOf(sequelize)) throw Error('makeSequelizeDriver expects parameter 1 to be an instance of Sequelize')
  let state = Map({
    sequelize,
    model: Map()
  })
  return (input$) => {
    return O.merge(
      input$
        .filter(isKey(defineKey))
        .flatMap(([key, ...args]) =>
          executeDefinitions(sequelize, args)
        )
        .map((models) => {
          state = state.merge(models)
          return state
        }),
      input$
        .filter(isKey(createKey))
        .flatMap(([key, ...args]) => executeCreates(state, ...args)),
      input$.filter(isKey(
        [createKey, defineKey],
        true
      )).map((k) => { throw new Error(`Undefined operation: ${k}`) })
    )
  }
}

const isKey = (k, invert = false) =>
  Array.prototype.isPrototypeOf(k)
    ? ([x, ...rest]) =>
      invert
        ? k.indexOf(x) === -1
        : k.indexOf(x) > -1
    : ([x, ...rest]) =>
      invert
        ? k !== x
        : k === x

