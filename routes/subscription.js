var express = require('express');
var router = express.Router();
const subscriptionHandler = require('../subscriptionHandler')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post("/", subscriptionHandler.handlePushNotificationSubscription);
router.get("/:id", subscriptionHandler.sendPushNotification);
router.get("/notify-all", subscriptionHandler.sendPushNotificationToAll);
router.get("/list", subscriptionHandler.listSubscription);
module.exports = router;
