import test from 'ava'
import Sequelize from 'sequelize'
import fs from 'fs'
import Rx from 'rx'

import { makeSequelizeDriver, define, create } from '../../dist/index.js'

const storage = `${__dirname}/test.sqlite`
global.sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage })

test.cb.after((t) => {
  fs.unlink(storage, (err, data) => {
    if (err) console.error(err)
    t.end()
  })
})

test.cb('Definition operations', (t) => {
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
          Rx.Observable.of(s.get('testset').count())
            .subscribe(
              (n) => { if (n === 0) t.pass(); t.end() },
              () => { t.fail('Table not created'); t.end() }
            )
        } else {
          t.fail('Definition not properly made.')
          t.end()
        }
      },
      (err) => { t.fail(err.message); t.end() }
    )
})

test.cb('Insertion operations', (t) => {
  try {
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
          if (++i > 3) { t.fail('Stopped by guard'); return t.end() }
          s.get('testset').findOne({ where: { a: 'test1' } })
            .then(() => { t.pass(); t.end() })
            .catch(() => { t.fail('Failed to query DB'); t.end() })
        })
    )

    subject$.onNext(
      'testset',
      { a: { type: Sequelize.STRING } },
      { freezeTableName: true }
    )
    actions$.subscribe(
      (op) => { subject$.onNext(op) },
      () => { t.fail(); t.end() }
    )
  } catch (e) {
    t.fail(e.message)
    t.end()
  }
})

