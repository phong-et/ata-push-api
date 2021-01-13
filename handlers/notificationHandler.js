global.attendanceNotificationService = null;
async function startService(_, res) {
  try {
    if (global.attendanceNotificationService === null) {
      global.attendanceNotificationService = require('../attendanceNotificationService');
      global.attendanceNotificationService.run().then(() =>
        global.attendanceNotificationService.sendInfo({
          res: res,
          log: console.log,
          service: global.attendanceNotificationService,
          success: true,
        })
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
    global.attendanceNotificationService.run().then(() =>
      global.attendanceNotificationService.sendInfo({
        res: res,
        log: console.log,
        service: global.attendanceNotificationService,
      })
    );
  } else
    res.send({
      success: false,
      message: 'Service has never been started',
    });
}

module.exports = {
  startService,
  stopService,
  getInfos,
};
