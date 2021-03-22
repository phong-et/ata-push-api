var express = require('express');
var router = express.Router();
const subscriptionHandler = require('../handlers/subscriptionHandler');
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', subscriptionHandler.handlePushNotificationSubscription);
router.post('/notify/:id', subscriptionHandler.pushSubscription);
router.post('/notify/', subscriptionHandler.pushSubscriptions);
router.post('/notify-all', subscriptionHandler.pushAllSubscriptions);
router.get('/list', subscriptionHandler.listSubscriptions);
router.get('/list/db', subscriptionHandler.listSubscriptionsFromDb);
router.get('/check/:id', subscriptionHandler.isExistedSubscriptionId);
module.exports = router;
 