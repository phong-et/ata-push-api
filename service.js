const cron = require('cron'),
  fetch = require('node-fetch'),
  log = console.log,
  host =
    process.env.NODE_ENV === 'production'
      ? 'https://ata-push-api.herokuapp.com'
      : 'http://localhost:8888';

function notify(type) {
  let url =
      host +
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

const jobNotifyCheckin = new cron.CronJob({
  cronTime: `00 25 09 * * 0-6`,
  onTick: function () {
    log('Notify checkin...');
    notify('in');
  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh',
});
const jobNotifyCheckout = new cron.CronJob({
  cronTime: `00 59 17 * * 0-6`,
  onTick: function () {
    log('Notify checkout...');
    notify('out');
  },
  start: true,
  timeZone: 'Asia/Ho_Chi_Minh',
});
function run() {
  log('> Notify attendance service is running...');
  jobNotifyCheckin.start();
  jobNotifyCheckout.start();
}
module.exports = { run, notify };
(() => log('> Notify service injected'))();
