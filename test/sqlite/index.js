import test from 'ava'
import Sequelize from 'sequelize'
import fs from 'fs'
import Rx from 'rx'

import { makeSequelizeDriver, define } from '../../dist/index.js'

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
              (n) => { if (n === 0) t.pass() },
              () => { t.fail('Table not created') }
            )
        } else {
          t.fail('Definition not properly made.')
        }
        t.end()
      },
      (err) => { t.fail(err.message); t.end() }
    )
})

