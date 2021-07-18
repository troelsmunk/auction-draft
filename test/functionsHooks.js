import setup from "./setupFunctionsTesting.js"
const { adminDatabase, test } = setup

export const mochaHooks = {
  afterAll(done) {
    test.cleanup()
    done()
  },
  beforeEach() {
    return adminDatabase.ref().remove()
  },
}
