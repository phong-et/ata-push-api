const { formatMH, notify, fetchOfficeSettings } = require('./attendanceUtils'),
  cron = require('cron'),
  log = console.log,
  serviceName = 'Notification Checkout Service';

let serviceStatus = 'initial',
  jobNotifyCheckoutCount = 0,
  notifyCheckoutTime,
  errorMessage = '',
  getServiceStatus = () => serviceStatus,
  getJobNotifyCheckoutCount = () => jobNotifyCheckoutCount,
  getNotifyCheckoutTime = () => notifyCheckoutTime,
  getErrorMessage = () => errorMessage,
  notifyCheckout = () => notify('out');

async function start() {
  try {
    let officeSettings = await fetchOfficeSettings();
    let endTime = new Date(officeSettings.endTime);
    notifyCheckoutTime =
      formatMH(endTime.getMinutes()) + ' ' + formatMH(endTime.getHours());

    let jobNotifyCheckout = new cron.CronJob({
      cronTime: `00 ${notifyCheckoutTime} * * 0-6`,
      onTick: function () {
        jobNotifyCheckoutCount++;
        log('Notify checkout...');
        notifyCheckout();
      },
      start: true,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    jobNotifyCheckout.start();
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
        notificationCheckoutServiceInfo: {
          serviceStatus: getServiceStatus(),
          jobNotifyCheckoutCount: getJobNotifyCheckoutCount(),
          notifyCheckoutTime: getNotifyCheckoutTime(),
          errorMessage: getErrorMessage(),
        },
      });
      break;
    default:
      log(message);
      break;
  }
});
