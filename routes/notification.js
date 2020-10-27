var express = require('express');
var router = express.Router();

const {
  startService,
  getInfos,
  stopService,
} = require('../handlers/notificationHandler');

router.get('/', (_, res) => res.send('notification root routing'))
router.get('/infos', getInfos);
router.post('/start', startService);
router.put('/stop', stopService);
module.exports = router;
