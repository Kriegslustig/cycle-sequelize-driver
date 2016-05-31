const assert = require('chai').assert // eslint-disable-line
/* global describe */
/* global it */
/* global afterEach */
/* global beforeEach */

const Sequelize = require('sequelize')
const fs = require('fs')
const Rx = require('rx')

const s = require('../dist/index.js')
const makeSequelizeDriver = s.makeSequelizeDriver
const define = s.define
const create = s.create
const findOne = s.findOne

const h = require('./helpers.js')

const storage = `${__dirname}/test.sqlite`

beforeEach(() => {
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
    const subject$ = h.createTestTable()
    const output$ = makeSequelizeDriver(global.sequelize)(subject$)
    const actions$ = output$
      .filter((s) => s.has('testset'))
      .map(((executed) => (s) => {
        if (executed) return s
        executed = true

        // Create an entity
        setTimeout(() => {
          s.get('testset').findOne({ where: { a: 'test1' } })
            .then((o) => {
              assert.ok(o)
              assert.equal(o.a, 'test1')
              done()
            })
            .catch((err) => { throw err })
        }, 200)
        return create('testset', { a: 'test1' })
      })(false))

    actions$.subscribe(
      (op) => { subject$.onNext(op) },
      (err) => { throw err }
    )
  })
})

describe('Find operations', () => {
  it('should find contents of a table and send updates reactively', (done) => {
    const subject$ = h.createTestTable()
    const output$ = makeSequelizeDriver(global.sequelize)(subject$).share()
    const actions$ = Rx.Observable.merge(
      output$
        .filter((s) => s.has('testset'))
        .map(h.once(() =>
          create('testset', { a: 'test7' })
        )),
      output$
        .filter((s) => s.has('testset'))
        .flatMap((s) => findOne(s.get('testset'), { where: { a: 'test7' } }))
        .tap((inst) => {
          assert.equal(inst.getDataValue('a'), 'test7')
          done()
        })
        .filter(() => false)
    ).filter((op) => !!op)
    actions$.subscribe(
      (op) => { subject$.onNext(op) },
      (err) => { console.error(err); throw err }
    )
  })
})

