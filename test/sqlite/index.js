const assert = require('chai').assert // eslint-disable-line
/* global describe */
/* global it */
/* global after */

const Sequelize = require('sequelize')
const fs = require('fs')
const Rx = require('rx')

const s = require(`${__dirname}/../../dist/index.js`)
const makeSequelizeDriver = s.makeSequelizeDriver
const define = s.define
const create = s.create

const storage = `${__dirname}/test.sqlite`
global.sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage })

describe('hooks', () => {
  after(() => {
    fs.unlinkSync(storage)
  })
})

describe('Definition operations', () => {
  it('should create a table', (done) => {
    const input$ = Rx.Observable.of(define(
      'testset',
      { a: { type: Sequelize.STRING } },
      { freezeTableName: true }
    ))
    makeSequelizeDriver(global.sequelize)(input$)
      .subscribe(
        (s) => {
          if (
            s.has('testset')
          ) {
            Rx.Observable.fromPromise(s.get('testset').count())
              .subscribe(
                (n) => { assert.equal(n, 0); done() },
                (err) => { throw err }
              )
          } else {
            throw new Error('Definition not properly made.')
          }
        },
        (err) => { throw err }
      )
  })
})

describe('Insertion operations', () => {
  it('should insert entries', function (done) {
    const subject$ = new Rx.Subject()
    const output$ = makeSequelizeDriver(global.sequelize)(subject$)
    const actions$ = Rx.Observable.merge(
      output$
        .filter((s) => s.has('testset'))
        .map(((executed) => (s) => {
          if (executed) return s
          executed = true

          // Create an entity
          return create({ a: 'test1' })
        })(false))
        .tap((i) => (s) => {
          if (++i > 3) { throw new Error('Stopped by guard') }
          s.get('testset').findOne({ where: { a: 'test1' } })
            .then((o) => {
              o.assert.equal({ a: 'test1' })
              done()
            })
            .catch(() => { throw new Error('Failed to query DB') })
        })
    )

    subject$.onNext(define(
      'testset',
      { a: { type: Sequelize.STRING } },
      { freezeTableName: true }
    ))
    actions$.subscribe(
      (op) => { subject$.onNext(op) },
      () => { throw new Error() }
    )
  })
})

