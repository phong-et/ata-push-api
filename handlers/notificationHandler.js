const log = console.log,
  childProcess = require('child_process');
global.notificationAttendanceServiceChannel = null;

async function startService(_, res) {
  if (!global.notificationAttendanceServiceChannel) {
    let notificationAttendanceServiceChannel = childProcess.fork(
      './notificationAttendanceService.js'
    );
    notificationAttendanceServiceChannel.on('message', async (message) => {
      log('Server got msg:', message);
      global.notificationAttendanceServiceInfo =
        message.notificationAttendanceServiceInfo;
    });
    notificationAttendanceServiceChannel.send({
      statement: 'start',
    });
    global.notificationAttendanceServiceChannel = notificationAttendanceServiceChannel;
    res.status(201).json({
      msg: 'Service started successfully',
    });
  } else
    res.status(201).json({
      msg: 'Service already has been runing before',
    });
}

function stopService(req, res) {
  let process = global.notificationAttendanceServiceChannel,
    msg;
  try {
    let isProcessKilled = process && process.kill();
    log('isProcessKilled:%s', isProcessKilled);
    if (isProcessKilled) msg = 'Service stopped';
    else msg = 'Service never start';
  } catch (error) {
    log(error);
    msg = 'Stop service has got error';
  }
  global.notificationAttendanceServiceChannel = null;
  global.notificationAttendanceServiceInfo = null;
  log('> Notification Attendance service stopped');
  res.status(201).json({ msg });
}

async function getInfos(_, res) {
  if (global.notificationAttendanceServiceChannel) {
    global.notificationAttendanceServiceChannel.send({
      statement: 'getInfos',
    });
    await new Promise((r) => setTimeout(r, 2000));
    let info = global.notificationAttendanceServiceInfo;
    res.send({
      status: info.serviceStatus,
      jobNotifyCheckinCount: info.jobNotifyCheckinCount,
      jobNotifyCheckoutCount: info.jobNotifyCheckoutCount,
      notifyTime: info.notifyTime,
      errorMessage: info.errorMessage
    });
  } else
    res.send({
      msg: 'Service already has not started yet',
    });
}

module.exports = {
  startService,
  stopService,
  getInfos,
};
