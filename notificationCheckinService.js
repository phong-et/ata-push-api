const { formatMH, notify, fetchOfficeSettings } = require('./attendanceUtils'),
  cron = require('cron'),
  log = console.log,
  serviceName = 'Notification Checkin Service';

let serviceStatus = 'initial',
  jobNotifyCheckinCount = 0,
  notifyCheckinTime,
  errorMessage = '',
  getServiceStatus = () => serviceStatus,
  getJobNotifyCheckinCount = () => jobNotifyCheckinCount,
  getNotifyCheckinTime = () => notifyCheckinTime,
  getErrorMessage = () => errorMessage,
  notifyCheckin = () => notify('in');

async function start() {
  try {
    let officeSettings = await fetchOfficeSettings();
    let startTime = new Date(
      new Date(officeSettings.startTime).getTime() - 5 * 60 * 1000
    );
    notifyCheckinTime =
      formatMH(startTime.getMinutes()) + ' ' + formatMH(startTime.getHours());
    log(notifyCheckinTime)
    let jobNotifyCheckin = new cron.CronJob({
      cronTime: `00 ${notifyCheckinTime} * * 0-6`,
      onTick: function () {
        jobNotifyCheckinCount++;
        log('Notify checkin...');
        notifyCheckin();
      },
      start: true,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    jobNotifyCheckin.start();
    serviceStatus = 'running';
    log(`> ${serviceName} is running...`);
  } catch (error) {
    serviceStatus = 'stop';
    errorMessage = `${serviceName} got error: ${error.message}`;
    log('> %s', errorMessage);
  }
}
(() => log(`> ${serviceName} was injected`))();
process.on('message', async (message) => {
  log('> %s got message: %s', serviceName, message);
  switch (message.statement) {
    case 'start':
      await start();
      break;
    case 'getInfos':
      // => https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback
      // => The resulting message might not be the same as what is originally sent.
      process.send({
        notificationCheckinServiceInfo: {
          serviceStatus: getServiceStatus(),
          jobNotifyCheckinCount: getJobNotifyCheckinCount(),
          notifyCheckinTime: getNotifyCheckinTime(),
          errorMessage: getErrorMessage(),
        },
      });
      break;
    default:
      log(message);
      break;
  }
});
