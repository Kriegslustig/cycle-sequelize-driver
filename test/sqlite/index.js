import test from 'ava'
import Sequelize from 'sequelize'
import fs from 'fs'

// import makeSequelizeDriver from './dist/index.js'

const storage = `${__dirname}/test.sqlite`

test.before((t) => {
  fs.writeFile(storage, '', (err) => {
    if (err) return t.fail()
    global.sequelize = new Sequelize('test', null, null, { dialect: 'sqlite', storage })
    t.pass()
  })
})

test.after((t) => {
  fs.unlink(storage, (err, data) => {
    if (err) return t.fail()
    t.pass()
  })
})

test('Insert operations', (t) => {
  t.pass()
})

