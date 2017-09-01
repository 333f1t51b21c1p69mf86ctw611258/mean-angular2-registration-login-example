const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();
const fileService = require('../../services/file.service');

router.route('/')
  .get((...args) => controller.find(...args))
  .post((...args) => controller.create(...args));

router.route('/detail/:id')
  .put((...args) => controller.update(...args))
  .get((...args) => controller.findById(...args))
  .delete((...args) => controller.remove(...args));

router.route('/uploadBlacklistFile')
  .post(fileService.multipart.any(), (...args) => controller.uploadBlacklistFile(...args));

module.exports = router;
