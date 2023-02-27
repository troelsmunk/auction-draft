let kitSSRServer
module.exports = async function kitSSR(request, response) {
  if (!kitSSRServer) {
    kitSSRServer = require("./kitSSR/index").default
  }
  return kitSSRServer(request, response)
}
