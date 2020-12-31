global.attendanceNotificationService = null;
async function startService(_, res) {
  if (!global.attendanceNotificationService) {
    global.attendanceNotificationService = require('../attendanceNotificationService');
    global.attendanceNotificationService.run().then(() => {
      let infos = global.attendanceNotificationService.serviceInfos();
      res.send({
        serviceStatus: infos.getServiceStatus(),
        jobNotifyCheckinCount: infos.getJobNotifyCheckinCount(),
        jobNotifyCheckoutCount: infos.getJobNotifyCheckoutCount(),
        notifyTime: infos.getNotifyTime(),
        errorMessage: infos.getErrorMessage(),
      });
    });
  } else
    res.send({
      msg: 'Service has already been started',
    });
}

function stopService(req, res) {
  if (global.attendanceNotificationService) {
    global.attendanceNotificationService = null;
    res.send({
      msg: 'Service has already been stopped',
    });
  } else
    res.send({
      msg: 'Service has never been started',
    });
}

async function getInfos(_, res) {
  if (global.attendanceNotificationService) {
    let infos = global.attendanceNotificationService.serviceInfos();
    res.send({
      serviceStatus: infos.getServiceStatus(),
      jobNotifyCheckinCount: infos.getJobNotifyCheckinCount(),
      jobNotifyCheckoutCount: infos.getJobNotifyCheckoutCount(),
      notifyTime: infos.getNotifyTime(),
      errorMessage: infos.getErrorMessage(),
    });
  } else
    res.send({
      msg: 'Service has never been started',
    });
}

module.exports = {
  startService,
  stopService,
  getInfos,
};
