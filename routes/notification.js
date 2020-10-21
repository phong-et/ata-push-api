var express = require('express');
var router = express.Router();
/* GET notification listing. */
router.get('/', function (req, res, next) {
  res.send('notification root routing');
});

router.get('/status', (_, res) =>
  res.send({
    status: global.notificationServiceStatus,
  })
);
router.post('/start', async (_, res) => {
  if (global.notificationServiceStatus === 'Stop') {
    var service = require('../notificationAttedanceService');
    await service.run();
    global.notificationServiceStatus = service.getServiceStatus();
    res.send({
      status: global.notificationServiceStatus,
      msg: 'Service ran',
    });
  } else {
    res.send({
      status: global.notificationServiceStatus,
      msg: 'Service already has been runing before',
    });
  }
});
module.exports = router;
