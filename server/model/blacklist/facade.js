const Facade = require('../../lib/facade');
const blacklistSchema = require('./schema');

class BlacklistFacade extends Facade {}

module.exports = new BlacklistFacade(blacklistSchema);
