const log = console.log,
  childProcess = require('child_process');
global.notificationAttendanceServiceChannel = null;

async function startService(_, res) {
  if (!global.notificationAttendanceServiceChannel) {
    let notificationAttendanceServiceChannel = childProcess.fork(
      './notificationAttendanceService.js'
    );
    notificationAttendanceServiceChannel.on('message', async (message) => {
      //log('startService, Server got msg:', message);
      if (message.startServiceInfo)
        res.send({
          ...message,
        });
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
    global.notificationAttendanceServiceChannel.on(
      'message',
      async (message) => {
        //log('getInfos, Server got msg:', message);
        if (message.getInfos)
          res.send({
            ...message,
          });
      }
    );
    global.notificationAttendanceServiceChannel.send({
      statement: 'getInfos',
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
