const { adminDatabase, test } = require("./setupFunctionsTesting.js")

const afterAll = function () {
  test.cleanup()
  return adminDatabase.ref().remove()
}
const beforeEach = function () {
  return adminDatabase.ref().remove()
}

exports.mochaHooks = { afterAll, beforeEach }
