const Facade = require('../../lib/facade');
const profileSchema = require('./schema');

class ProfileFacade extends Facade {}

module.exports = new ProfileFacade(profileSchema);
