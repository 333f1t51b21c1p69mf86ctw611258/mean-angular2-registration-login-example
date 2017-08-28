const Controller = require('../../lib/controller');
const blacklistFacade = require('./facade');

class BlacklistController extends Controller {}

module.exports = new BlacklistController(blacklistFacade);
