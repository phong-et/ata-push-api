const log = console.log,
  childProcess = require('child_process');
global.notificationAttendanceServiceChannel = null;
global.notificationAttendanceServiceInfo = null;

async function startService(_, res) {
  if (!global.notificationAttendanceServiceChannel) {
    let notificationAttendanceServiceChannel = childProcess.fork(
      './notificationAttendanceService.js'
    );
    // Create listener for all communication of child process at here
    // Only response.send to HTTP Client with /startService
    // Other receiving message only assign to global notificationAttendanceServiceInfo
    // So other handler must use await to catch global notificationAttendanceServiceInfo data
    notificationAttendanceServiceChannel.on('message', async (message) => {
      log('startService, Server got msg:', message);
      if (message.startServiceInfo) {
        global.notificationAttendanceServiceInfo = message.startServiceInfo;
        res.send(global.notificationAttendanceServiceInfo);
      } else if (message.getInfos)
        global.notificationAttendanceServiceInfo = message.getInfos;
    });
    notificationAttendanceServiceChannel.send({
      statement: 'start',
    });
    global.notificationAttendanceServiceChannel = notificationAttendanceServiceChannel;
  } else
    res.send({
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
  log('> Notification Attendance service stopped');
  res.send({ msg });
}

async function getInfos(_, res) {
  if (global.notificationAttendanceServiceChannel) {
    // send statement to child process
    global.notificationAttendanceServiceChannel.send({
      statement: 'getInfos',
    });
    // await data will be sent from child process through global.notificationAttendanceServiceInfo
    await new Promise((r) => setTimeout(r, 2000));
    log(global.notificationAttendanceServiceInfo);
    res.send(global.notificationAttendanceServiceInfo);
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
