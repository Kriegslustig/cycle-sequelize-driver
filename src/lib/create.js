import { Observable as O } from 'rx'
import { validate } from './_helpers.js'

/**
 * @typedef {[ string, [ object, object ] ]} createOp
 */

export const createKey = Symbol.for('sequelize create action')

export function create (collection, ...parameters) {
  return [
    createKey,
    [collection,
      Array.prototype.isPrototypeOf(parameters[0])
        ? parameters
        : [parameters]
    ]
  ]
}

/**
 * @param sequelize {object} An instance of sequelize
 * @param creations {array<collection, array<createOp>>} Creation operations
 */
export function executeCreates (state, [collection, creationOps]) {
  return O.create((observer) => {
    if (!validate.isCollection(state, collection, observer)) return
    const options = creationOps.reduce(
      (m, [o, t]) => Object.assign({}, m, t),
      {}
    )
    state.get(collection).bulkCreate(
      (creationOps.map(([o, t]) => o)),
      options
    )
      .then(() => observer.onCompleted())
      .catch((err) => {
        observer.onError(err)
        observer.onCompleted()
      })
  })
}

