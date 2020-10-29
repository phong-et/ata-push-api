const fetch = require('node-fetch'),
  log = console.log,
  hostPushAPI =
    process.env.NODE_ENV === 'production'
      ? 'https://ata-push-api.herokuapp.com'
      : 'http://localhost:8888',
  hostAta =
    process.env.NODE_ENV === 'production'
      ? 'https://atacore.azurewebsites.net'
      : 'http://localhost:5000';

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
module.exports = {
  notify,
  fetchOfficeSettings,
  formatMH,
};
