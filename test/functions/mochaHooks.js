const { adminDatabase, test } = require("./setupFunctionsTesting.js")

const beforeEach = function () {
  return adminDatabase.ref().remove()
}
const afterAll = function () {
  test.cleanup()
  return adminDatabase.ref().remove()
}

exports.mochaHooks = { afterAll, beforeEach }
