const express = require('express'),
  router = express.Router(),
  notificationAttendanceHandler = require('../handlers/notificationHandler');

router.get('/', (_, res) => res.send('notification root routing'));
// one service
router.post(
  '/service/attendance/start',
  notificationAttendanceHandler.startService
);
router.put(
  '/service/attendance/stop',
  notificationAttendanceHandler.stopService
);
router.get('/service/attendance/infos', notificationAttendanceHandler.getInfos);
module.exports = router;
