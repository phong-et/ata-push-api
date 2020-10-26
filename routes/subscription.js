var express = require('express');
var router = express.Router();
const subscriptionHandler = require('../handlers/subscriptionHandler');
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', subscriptionHandler.handlePushNotificationSubscription);
router.get('/notify/:id', subscriptionHandler.sendPushNotification);
router.get('/notify-all', subscriptionHandler.sendPushNotificationToAll);
router.get('/list', subscriptionHandler.listSubscription);
router.get('/check/:id', subscriptionHandler.isExistedSubscriptionId);
module.exports = router;
