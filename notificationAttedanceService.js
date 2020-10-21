const cron = require('cron'),
  fetch = require('node-fetch'),
  log = console.log,
  hostPushAPI =
    process.env.NODE_ENV === 'production'
      ? 'https://ata-push-api.herokuapp.com'
      : 'http://localhost:8888',
  hostAta =
    process.env.NODE_ENV === 'production'
      ? 'https://atacore.azurewebsites.net'
      : 'http://localhost:5000';

let serviceStatus = 'Initial',
  getServiceStatus = () => serviceStatus;
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
        formatMH(startTime.getMinutes() - 5) + ' ' + formatMH(startTime.getHours()),
      notifyCheckOutTime =
        formatMH(endTime.getMinutes()) + ' ' + formatMH(endTime.getHours()),
      jobNotifyCheckin = new cron.CronJob({
        cronTime: `00 ${notifyCheckInTime} * * 0-6`,
        onTick: function () {
          log('Notify checkin...');
          notify('in');
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
      jobNotifyCheckout = new cron.CronJob({
        cronTime: `00 ${notifyCheckOutTime} * * 0-6`,
        onTick: function () {
          log('Notify checkout...');
          notify('out');
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    serviceStatus = 'Running';
    log(notifyCheckInTime)
    jobNotifyCheckin.start();
    jobNotifyCheckout.start();

    log('> Notification attendance service is running...');
  } catch (error) {
    serviceStatus = 'Stop';
    log('> Notification attendance service got error: %s', error.message);
  }
}

module.exports = {
  run,
  getServiceStatus
};
(() => log('> Notification attendance service was injected'))();
