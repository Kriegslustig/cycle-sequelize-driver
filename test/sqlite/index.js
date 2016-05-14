const test = require('tape')
const tapSpec = require('tap-spec')
const Sequelize = require('sequelize')
const fs = require('fs')
const Rx = require('rx')

const s = require(`${__dirname}/../../dist/index.js`)
const makeSequelizeDriver = s.makeSequelizeDriver
const define = s.define
const create = s.create

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

const storage = `${__dirname}/test.sqlite`
global.sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage })

test.onFinish((t) => {
  fs.unlinkSync(storage)
})

test('Definition operations', (t) => {
  t.plan(1)
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
              (n) => { t.equal(n, 0) },
              () => { t.fail('Table not created') }
            )
        } else {
          t.fail('Definition not properly made.')
        }
      },
      (err) => { t.fail(err.message) }
    )
})

test('Insertion operations', (t) => {
  t.plan(1)
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
})

