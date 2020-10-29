const log = console.log,
  childProcess = require('child_process');
global.notificationAttendanceServiceChannel = null;

async function startService(_, res) {
  if (!global.notificationCheckoutServiceChannel) {
    let notificationCheckoutServiceChannel = childProcess.fork(
      './notificationCheckoutService.js'
    );
    notificationCheckoutServiceChannel.on('message', async (message) => {
      log('Server got msg:', message);
      global.notificationCheckoutServiceInfo =
        message.notificationCheckoutServiceInfo;
    });
    notificationCheckoutServiceChannel.send({
      statement: 'start',
    });
    global.notificationCheckoutServiceChannel = notificationCheckoutServiceChannel;
    res.status(201).json({
      msg: 'Service started successfully',
    });
  } else
    res.status(201).json({
      msg: 'Service already has been runing before',
    });
}

function stopService(_, res) {
  var process = global.notificationCheckoutServiceChannel,
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
  global.notificationCheckoutServiceChannel = null;
  global.notificationCheckoutServiceInfo = null;
  log('> %s', msg);
  res.status(201).json({ msg });
}

async function getInfos(_, res) {
  if (global.notificationCheckoutServiceChannel) {
    global.notificationCheckoutServiceChannel.send({
      statement: 'getInfos',
    });
    await new Promise((r) => setTimeout(r, 2000));
    let info = global.notificationCheckoutServiceInfo;
    res.send({
      status: info.serviceStatus,
      jobNotifyCheckoutCount: info.jobNotifyCheckoutCount,
      notifyCheckoutTime: info.notifyCheckoutTime,
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
