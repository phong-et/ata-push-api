var express = require('express');
var router = express.Router();
const subscriptionHandler = require('../handlers/subscriptionHandler');
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', subscriptionHandler.handlePushNotificationSubscription);
router.get('/notify/:id', subscriptionHandler.sendPushNotification);
router.post('/notify-all', subscriptionHandler.sendPushNotificationToAll);
router.get('/list', subscriptionHandler.listSubscription);
router.get('/list/db', subscriptionHandler.listSubscriptionFromDb);
router.get('/check/:id', subscriptionHandler.isExistedSubscriptionId);
module.exports = router;
