const cron = require('cron'),
  env = process.env.NODE_ENV || 'development',
  config = require('./config.json')[env],
  fetch = require('node-fetch'),
  log = console.log,
  hostPushAPI = config.hostPushAPI,
  hostAta = config.hostAta,
  serviceName = 'Notification Attendance';
let serviceStatus = 'initial',
  jobNotifyCheckinCount = 0,
  jobNotifyCheckoutCount = 0,
  notifyTime = {},
  errorMessage = null,
  getServiceStatus = () => serviceStatus,
  getJobNotifyCheckinCount = () => jobNotifyCheckinCount,
  getJobNotifyCheckoutCount = () => jobNotifyCheckoutCount,
  getNotifyTime = () => notifyTime,
  getErrorMessage = () => errorMessage,
  getInfos = () => {
    return {
      getServiceStatus,
      getJobNotifyCheckinCount,
      getJobNotifyCheckoutCount,
      getNotifyTime,
      getErrorMessage,
    };
  };
function notify(type) {
  let url = hostPushAPI + '/subscription/notify-all',
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + config.tokenAtaPushAPI,
      },
      body: JSON.stringify({
        title: `HAVE YOU CHECKED ${type.toUpperCase()} YET ?`,
        text: `Please click here go to check${type.toLowerCase()} page`,
      }),
    };
  fetch(url, options).then((response) => {
    log(`${response.url}: ${response.status}(${response.statusText})`);
  });
}

async function fetchOfficeSettings() {
  return await fetch(hostAta + '/api/officesettings')
    .then(async (response) => {
      if (response.status === 200)
        return {
          success: true,
          data: JSON.parse(await response.text()),
        };
      return {
        success: false,
        message: response.url + ' ' + response.statusText,
      };
    })
    .catch((error) => {
      log(error);
      return { success: false, message: error.message };
    });
}

function formatMH(mhNumber) {
  return mhNumber >= 10 ? mhNumber : '0' + mhNumber;
}

async function run() {
  try {
    let responseOfficeSetting = await fetchOfficeSettings();
    if (responseOfficeSetting.success) {
      let officeSettings = responseOfficeSetting.data;
      let startTime = new Date(
          new Date(officeSettings.startTime).getTime() - 5 * 60 * 1000
        ),
        notifyCheckinTime =
          formatMH(startTime.getMinutes()) +
          ' ' +
          formatMH(startTime.getHours()),
        notifyCheckinTimeISO = officeSettings.startTime,
        notifyCheckinTimeGMT = startTime.toGMTString(),
        notifyCheckinTimeLocaleDate =
          startTime.toLocaleDateString() +
          ', ' +
          startTime.toLocaleTimeString();
      let jobNotifyCheckin = new cron.CronJob({
        cronTime: `00 ${notifyCheckinTime} * * 0-6`,
        onTick: function () {
          jobNotifyCheckinCount++;
          log('Notify checkin...');
          notify('in');
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      let endTime = new Date(officeSettings.endTime),
        notifyCheckoutTime =
          formatMH(endTime.getMinutes()) + ' ' + formatMH(endTime.getHours()),
        notifyCheckoutTimeISO = officeSettings.endTime,
        notifyCheckoutTimeGMT = endTime.toGMTString(),
        notifyCheckoutTimeLocaleDate =
          endTime.toLocaleDateString() + ', ' + endTime.toLocaleTimeString();
      let jobNotifyCheckout = new cron.CronJob({
        cronTime: `00 ${notifyCheckoutTime} * * 0-6`,
        onTick: function () {
          jobNotifyCheckoutCount++;
          log('Notify checkout...');
          notify('out');
        },
        start: true,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      serviceStatus = 'running';
      notifyTime = {
        // checkin
        notifyCheckInTime: notifyCheckinTime,
        notifyCheckinTimeISO: notifyCheckinTimeISO,
        notifyCheckinTimeGMT: notifyCheckinTimeGMT,
        notifyCheckinTimeLocaleDate: notifyCheckinTimeLocaleDate,
        // checkout
        notifyCheckOutTime: notifyCheckoutTime,
        notifyCheckoutTimeISO: notifyCheckoutTimeISO,
        notifyCheckoutTimeGMT: notifyCheckoutTimeGMT,
        notifyCheckoutTimeLocaleDate: notifyCheckoutTimeLocaleDate,
      };
      jobNotifyCheckin.start();
      jobNotifyCheckout.start();
      log(`> ${serviceName} service is running...`);
      return { success: true, message: 'running' };
    } else {
      errorMessage = responseOfficeSetting.message;
      return { success: false, message: responseOfficeSetting.message };
    }
  } catch (error) {
    serviceStatus = 'stop';
    errorMessage = `${serviceName} service got error: ${error.message}`;
    log('> %s', error);
    return { success: false, message: error.message };
  }
}
function sendInfo({ log, res, service, message, success }) {
  try {
    let infos = service.getInfos();
    let notifyTime = infos.getNotifyTime();
    let info = {
      success: success,
      serviceStatus: infos.getServiceStatus(),
      jobNotifyCheckinCount: infos.getJobNotifyCheckinCount(),
      jobNotifyCheckoutCount: infos.getJobNotifyCheckoutCount(),
      notifyCheckinTime: notifyTime.notifyCheckinTimeLocaleDate.split(', ')[1],
      notifyCheckoutTime: notifyTime.notifyCheckoutTimeLocaleDate.split(
        ', '
      )[1],
      message: infos.getErrorMessage() || message || '',
    };
    if (log) log(info);
    if (res) res.send(info);
  } catch (error) {
    res.send(error);
  }
}
module.exports = { run, getInfos, sendInfo };
(() => log(`> ${serviceName} service was injected`))();
