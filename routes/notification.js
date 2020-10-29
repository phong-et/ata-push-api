const express = require('express'),
  router = express.Router(),
  notificationCheckinHandler = require('../handlers/notificationCheckinHandler'),
  notificationCheckoutHandler = require('../handlers/notificationCheckoutHandler')

router.get('/', (_, res) => res.send('notification root routing'));
router.get('/service/checkin/infos', notificationCheckinHandler.getInfos);
router.post('/service/checkin/start', notificationCheckinHandler.startService);
router.put('/service/checkin/stop', notificationCheckinHandler.stopService);
router.get('/service/checkout/infos', notificationCheckoutHandler.getInfos);
router.post('/service/checkout/start', notificationCheckoutHandler.startService);
router.put('/service/checkout/stop', notificationCheckoutHandler.stopService);
module.exports = router;
