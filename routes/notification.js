const express = require('express'),
  router = express.Router(),
  notificationCheckinHandler = require('../handlers/notificationCheckinHandler'),
  notificationCheckoutHandler = require('../handlers/notificationCheckoutHandler'),
  notificationAttendanceHandler = require('../handlers/notificationHandler')

router.get('/', (_, res) => res.send('notification root routing'));

// two services
router.get('/service/checkin/infos', notificationCheckinHandler.getInfos);
router.post('/service/checkin/start', notificationCheckinHandler.startService);
router.put('/service/checkin/stop', notificationCheckinHandler.stopService);
router.get('/service/checkout/infos', notificationCheckoutHandler.getInfos);
router.post('/service/checkout/start', notificationCheckoutHandler.startService);
router.put('/service/checkout/stop', notificationCheckoutHandler.stopService);

// one service
router.post('/service/attendance/start', notificationAttendanceHandler.startService);
router.put('/service/attendance/stop', notificationAttendanceHandler.stopService);
router.get('/service/attendance/infos', notificationAttendanceHandler.getInfos);
module.exports = router;
