const cron = require('cron'),
  fetch = require('node-fetch'),
  log = console.log,
  serviceName = 'Notification Attendance',
  hostPushAPI =
    process.env.NODE_ENV === 'production'
      ? 'https://ata-push-api.herokuapp.com'
      : 'http://localhost:8888',
  hostAta =
    process.env.NODE_ENV === 'production'
      ? 'https://atacore.azurewebsites.net'
      : 'http://localhost:5000';

let serviceStatus = 'initial',
  jobNotifyCheckinCount = 0,
  jobNotifyCheckoutCount = 0,
  getServiceStatus = () => serviceStatus,
  getJobNotifyCheckinCount = () => jobNotifyCheckinCount,
  getJobNotifyCheckoutCount = () => jobNotifyCheckoutCount,
  notifyTime = {},
  getNotifyTime = () => notifyTime;

function notify(type) {
  let url =
      hostPushAPI +
      '/subscription/notify-all?' +
      new URLSearchParams({
        title: `HAVE YOU CHECKED ${type.toUpperCase()} YET ?`,
        text: `Please click here go to check${type.toLowerCase()} page`,
      }),
    options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
  fetch(url, options).then((response) => {
    log(`${response.url}: ${response.status}(${response.statusText})`);
  });
}

async function fetchOfficeSettings() {
  return JSON.parse(
    await (await fetch(hostAta + '/api/officesettings')).text()
  );
}

function formatMH(mhNumber) {
  return mhNumber >= 10 ? mhNumber : '0' + mhNumber;
}

async function run() {
  try {
    let officeSettings = await fetchOfficeSettings(),
      startTime = new Date(officeSettings.startTime),
      endTime = new Date(officeSettings.endTime),
      notifyCheckInTime =
        formatMH(startTime.getMinutes() - 5) +
        ' ' +
        formatMH(startTime.getHours()),
      notifyCheckOutTime =
        formatMH(endTime.getMinutes()) + ' ' + formatMH(endTime.getHours()),
      jobNotifyCheckin = new cron.CronJob({
        cronTime: `00 ${notifyCheckInTime} * * 0-6`,
        onTick: function () {
          jobNotifyCheckinCount++;
          log('Notify checkin...');
          notify('in');
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
      jobNotifyCheckout = new cron.CronJob({
        cronTime: `00 ${notifyCheckOutTime} * * 0-6`,
        onTick: function () {
          jobNotifyCheckoutCount++;
          log('Notify checkout...');
          notify('out');
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    serviceStatus = 'running';
    notifyTime = { notifyCheckInTime, notifyCheckOutTime };
    //log(notifyCheckInTime);
    jobNotifyCheckin.start();
    jobNotifyCheckout.start();
    log(`> ${serviceName} service is running...`);
  } catch (error) {
    serviceStatus = 'stop';
    log(`> ${serviceName} service got error: %s`, error.message);
  }
}
module.exports = {
  run,
  getServiceStatus,
  getJobNotifyCheckinCount,
  getJobNotifyCheckoutCount,
  getNotifyTime,
};
(() => log(`> ${serviceName} service was injected`))();
process.on('message', async (message) => {
  log('%s service got message: %s', serviceName, message);
  switch (message.statement) {
    case 'start':
      await run();
      break;
    case 'getInfos':
      // => https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback
      // => The resulting message might not be the same as what is originally sent.
      process.send({
        notificationAttendanceServiceInfo: {
          serviceStatus: getServiceStatus(),
          jobNotifyCheckinCount: getJobNotifyCheckinCount(),
          jobNotifyCheckoutCount: getJobNotifyCheckoutCount(),
          notifyTime: getNotifyTime(),
        },
      });
      break;
    default:
      log(message);
      break;
  }
});
process.send({ service: 'attendence', statement: 'initial' });
