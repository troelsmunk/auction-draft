const setup = require("./setupFunctionsTesting.js")
const { adminDatabase, test } = setup

module.exports = mochaHooks = {
  afterAll(done) {
    test.cleanup()
    done()
  },
  beforeEach() {
    return adminDatabase.ref().remove()
  },
}
