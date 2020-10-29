const log = console.log,
  childProcess = require('child_process');
global.notificationAttendanceServiceChannel = null;

async function startService(_, res) {
  if (!global.notificationCheckinServiceChannel) {
    let notificationCheckinServiceChannel = childProcess.fork(
      './notificationCheckinService.js'
    );
    notificationCheckinServiceChannel.on('message', async (message) => {
      log('Server got msg:', message);
      global.notificationCheckinServiceInfo =
        message.notificationCheckinServiceInfo;
    });
    notificationCheckinServiceChannel.send({
      statement: 'start',
    });
    global.notificationCheckinServiceChannel = notificationCheckinServiceChannel;
    res.status(201).json({
      msg: 'Service started successfully',
    });
  } else
    res.status(201).json({
      msg: 'Service already has been runing before',
    });
}

function stopService(_, res) {
  var process = global.notificationCheckinServiceChannel,
    msg;
  try {
    isProcessKilled = process && process.kill();
    log('isProcessKilled:%s', isProcessKilled);
    if (isProcessKilled == true) msg = 'Service stopped';
    else msg = "Service isn't running";
  } catch (error) {
    log(error);
    msg = 'Service has got error:' + error.message;
  }
  global.notificationCheckinServiceChannel = null;
  global.notificationCheckinServiceInfo = null;
  log('> %s', msg);
  res.status(201).json({ msg });
}

async function getInfos(_, res) {
  if (global.notificationCheckinServiceChannel) {
    global.notificationCheckinServiceChannel.send({
      statement: 'getInfos',
    });
    await new Promise((r) => setTimeout(r, 2000));
    let info = global.notificationCheckinServiceInfo;
    res.send({
      status: info.serviceStatus,
      jobNotifyCheckinCount: info.jobNotifyCheckinCount,
      notifyCheckinTime: info.notifyCheckinTime,
      errorMessage: info.errorMessage,
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
