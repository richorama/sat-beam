const assert = require('assert')
const getBeam = require('./index').getBeam

describe('getBeam', () => {
  it('calculates a simple geometry', done => {
    const values = getBeam(0, 0, 100)
    assert.strictEqual(values.length, 51)
    done()
  })
})