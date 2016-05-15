const assert = require('chai').assert // eslint-disable-line
/* global describe */
/* global it */
/* global afterEach */
/* global beforeEach */

const Sequelize = require('sequelize')
const fs = require('fs')
const Rx = require('rx')

const s = require(`${__dirname}/../../dist/index.js`)
const makeSequelizeDriver = s.makeSequelizeDriver
const define = s.define
const create = s.create

const storage = `${__dirname}/test.sqlite`

beforeEach(() => {
  console.log('Before')
  global.sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage })
})

afterEach(() => {
  fs.unlinkSync(storage)
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
                (n) => { assert.isOk(n > -1, true); done() },
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

describe('Insertion operations', function () {
  it('should insert entries', function (done) {
    const subject$ = new Rx.ReplaySubject()
    const output$ = makeSequelizeDriver(global.sequelize)(subject$)
    const actions$ = Rx.Observable.merge(
      output$
        .filter((s) => s.has('testset'))
        .map(((executed) => (s) => {
          if (executed) return s
          executed = true

          // Create an entity
          setTimeout(() => {
            s.get('testset').findOne({ where: { a: 'test1' } })
              .then((o) => {
                assert.equal(o.a, 'test1')
                done()
              })
              .catch((err) => { throw err })
          }, 200)
          return create('testset', { a: 'test1' })
        })(false))
    )

    subject$.onNext(define(
      'testset',
      { a: { type: Sequelize.STRING } },
      { freezeTableName: true }
    ))
    actions$.subscribe(
      (op) => { subject$.onNext(op) },
      (err) => { throw err }
    )
  })
})

