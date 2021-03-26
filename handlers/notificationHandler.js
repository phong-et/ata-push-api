global.attendanceNotificationService = null;
let env = process.env.NODE_ENV || 'production',
  config = require('../config.json')[env],
  fetchAllSubscriptionsFromDb = require('../handlers/subscriptionHandler')
    .fetchAllSubscriptionsFromDb;

function syncSubscriptions() {
  fetchAllSubscriptionsFromDb(config)
    .then((response) => {
      if (response.success) {
        global.subscriptions = {}
        response.subscriptions.forEach((subscription) => {
          global.subscriptions[subscription.subscriptionHashId] = JSON.parse(
            subscription.subscriptionJSON
          );
        });
        console.log('loaded latest subscriptions');
      }
    });
}
async function startService(_, res) {
  try {
    if (global.attendanceNotificationService === null) {
      global.attendanceNotificationService = require('../attendanceNotificationService');
      global.attendanceNotificationService.run().then(() => {
        syncSubscriptions()
        global.attendanceNotificationService.sendInfo({
          res: res,
          log: console.log,
          service: global.attendanceNotificationService,
          success: true,
        })
      }
      );
    }
    else
      global.attendanceNotificationService.sendInfo({
        res: res,
        log: console.log,
        service: global.attendanceNotificationService,
        message: 'Service has already been started',
        success: true,
      });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
}

function stopService(req, res) {
  if (global.attendanceNotificationService) {
    global.attendanceNotificationService = null;
    res.send({
      success: true,
      message: 'Service has already been stopped',
    });
  } else
    res.send({
      success: false,
      message: 'Service has never been started',
    });
}

async function getInfos(_, res) {
  if (global.attendanceNotificationService) {
    global.attendanceNotificationService = require('../attendanceNotificationService');
    global.attendanceNotificationService.run().then(() => {
      syncSubscriptions()
      global.attendanceNotificationService.sendInfo({
        res: res,
        log: console.log,
        service: global.attendanceNotificationService,
      })
      
    });
  } else
    res.send({
      success: false,
      message: 'Service has never been started',
    });
}

module.exports = {
  syncSubscriptions,
  startService,
  stopService,
  getInfos,
};
