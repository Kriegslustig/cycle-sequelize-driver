const Rx = require('rx')
const Sequelize = require('sequelize')

const s = require('../dist/index.js')
const define = s.define

exports.createTestTable = function createTestTable () {
  const subject$ = new Rx.ReplaySubject()
  subject$.onNext(define(
    'testset',
    { a: { type: Sequelize.STRING } },
    { freezeTableName: true }
  ))
  return subject$
}

exports.once = (fn) => ((done) => function () {
  if (done) return
  done = true
  return fn.call(arguments)
})(false)

