const router = require('express').Router();

router.use('/prompt', require('./promptRoutes'));

module.exports = router;
