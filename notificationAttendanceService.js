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
  errorMessage = '',
  getServiceStatus = () => serviceStatus,
  getJobNotifyCheckinCount = () => jobNotifyCheckinCount,
  getJobNotifyCheckoutCount = () => jobNotifyCheckoutCount,
  getNotifyTime = () => notifyTime,
  getErrorMessage = () => errorMessage;

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
          startTime.toLocaleDateString() + ' ' + startTime.toLocaleTimeString();
      //notifyTime['notifyCheckinTime'] = notifyCheckinTime;
      //log(notifyCheckinTime);
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
          endTime.toLocaleDateString() + ' ' + endTime.toLocaleTimeString();
      //notifyTime['notifyCheckoutTime'] = notifyCheckoutTime;
      //log(notifyCheckoutTime);
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
        notifyCheckInTime: notifyCheckinTime,
        notifyCheckOutTime: notifyCheckoutTime,
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

(() => log(`> ${serviceName} service was injected`))();
process.on('message', async (message) => {
  log('%s service got message: %s', serviceName, message);
  switch (message.statement) {
    case 'start':
      let result = await run();
      process.send({
        startServiceInfo: { ...result },
      });
      break;
    case 'getInfos':
      // => https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback
      // => The resulting message might not be the same as what is originally sent.
      process.send({
        getInfos: {
          serviceStatus: getServiceStatus(),
          jobNotifyCheckinCount: getJobNotifyCheckinCount(),
          jobNotifyCheckoutCount: getJobNotifyCheckoutCount(),
          notifyTime: getNotifyTime(),
          errorMessage: getErrorMessage(),
        },
      });
      break;
    default:
      log(message);
      break;
  }
});
//process.send({ service: 'attendence', statement: 'initial' });
