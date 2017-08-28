const Router = require('express').Router;
const router = new Router();

const blacklist = require('./model/blacklist/router');
const antiddos = require('./model/antiddos/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to vhub-server API!' });
});

router.use('/blacklist', blacklist);
router.use('/antiddos', antiddos);

module.exports = router;
